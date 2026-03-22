import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { Parking } from "../types/parking";
import { getAllParking } from "../api/parkingApi";
import mqtt, { MqttClient } from "mqtt";

// ─── Types ────────────────────────────────────────────────────────────────────

type MqttStatus = "connecting" | "connected" | "disconnected" | "error";

interface ParkingContextType {
  parkings:    Parking[];
  loading:     boolean;
  error:       string | null;
  mqttStatus:  MqttStatus;
  lastUpdated: Date | null;
  refetch:     () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidGPS(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) && !isNaN(lng) &&
    !(Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ParkingProvider = ({ children }: { children: React.ReactNode }) => {
  const [parkings,    setParkings]    = useState<Parking[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [mqttStatus,  setMqttStatus]  = useState<MqttStatus>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const clientRef       = useRef<MqttClient | null>(null);
  const retryTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryCountRef   = useRef(0);
  const MAX_RETRIES     = 5;

  // ── API fetch (REST fallback + initial load) ───────────────────────────────
  const fetchParkingData = useCallback(async () => {
    try {
      const data = await getAllParking();
      if (!Array.isArray(data)) throw new Error("Invalid response from server.");
      if (data.length > 0) {
        setParkings(data);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to fetch parking data.";
      setError(message);
      console.error("[API] Fetch error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── MQTT connect ───────────────────────────────────────────────────────────
  const connectMqtt = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }

    setMqttStatus("connecting");

    const host     = import.meta.env.VITE_HIVEMQ_HOST;
    const port     = import.meta.env.VITE_HIVEMQ_PORT     || "8884";
    const username = import.meta.env.VITE_HIVEMQ_USERNAME;
    const password = import.meta.env.VITE_HIVEMQ_PASSWORD;

    // Connect to YOUR private HiveMQ Cloud over WebSocket/TLS (wss)
    // Port 8884 is the HiveMQ Cloud WSS port
    let client: MqttClient;
    try {
      client = mqtt.connect(`wss://${host}:${port}/mqtt`, {
        username,
        password,
        connectTimeout:  10_000,
        keepalive:       30,
        reconnectPeriod: 0,   // manual retry with back-off
        clientId: `smartpark_web_${Math.random().toString(16).slice(2, 8)}`,
        rejectUnauthorized: false,
      });
    } catch (err) {
      console.error("[MQTT] Failed to create client:", err);
      setMqttStatus("error");
      scheduleRetry();
      return;
    }

    clientRef.current = client;

    // ── Connected ────────────────────────────────────────────────────────────
    client.on("connect", () => {
      console.log("[MQTT] Connected to HiveMQ Cloud ✅");
      setMqttStatus("connected");
      setError(null);
      retryCountRef.current = 0;

      client.subscribe("smartparking/status", (err) => {
        if (err) {
          console.error("[MQTT] Subscribe error:", err);
          setError("Could not subscribe to parking topic.");
        }
      });
    });

    // ── Message received ─────────────────────────────────────────────────────
    // ESP32 payload shape:
    // { deviceId, slot1, slot2, occupiedSlots, totalSlots, gpsFixed, lat, lng }
    client.on("message", (_topic: string, message: Buffer) => {
      try {
        const raw  = message.toString();
        const data = JSON.parse(raw);

        if (!data.deviceId) {
          console.warn("[MQTT] Missing deviceId:", raw);
          return;
        }

        const slot1: "OCCUPIED" | "FREE" = data.slot1 === "OCCUPIED" ? "OCCUPIED" : "FREE";
        const slot2: "OCCUPIED" | "FREE" = data.slot2 === "OCCUPIED" ? "OCCUPIED" : "FREE";
        const occupied = (slot1 === "OCCUPIED" ? 1 : 0) + (slot2 === "OCCUPIED" ? 1 : 0);

        const incomingLat = parseFloat(data.lat);
        const incomingLng = parseFloat(data.lng);
        const gpsFixed    = (data.gpsFixed === true || data.gpsFixed === "true") &&
                            isValidGPS(incomingLat, incomingLng);

        // Build a Parking object that matches the type exactly
        const liveParking: Parking = {
          _id:           data.deviceId,
          deviceId:      data.deviceId,
          name:          data.name ?? "Smart Parking",
          location: {
            lat: gpsFixed ? incomingLat : 0,
            lng: gpsFixed ? incomingLng : 0,
          },
          gpsFixed,
          totalSlots:     typeof data.totalSlots === "number" ? data.totalSlots : 2,
          occupiedSlots:  occupied,
          availableSlots: (typeof data.totalSlots === "number" ? data.totalSlots : 2) - occupied,
          slot1,
          slot2,
          lastUpdated:    new Date().toISOString(),
        };

        setParkings(prev => {
          const idx = prev.findIndex(p => p.deviceId === liveParking.deviceId);
          if (idx === -1) return [...prev, liveParking];
          const next = [...prev];
          next[idx] = liveParking;
          return next;
        });

        setLastUpdated(new Date());
        setLoading(false);
        setError(null);

      } catch (err) {
        console.error("[MQTT] Parse error:", err);
        setError("Received malformed data from sensor.");
      }
    });

    // ── Error ────────────────────────────────────────────────────────────────
    client.on("error", (err) => {
      console.error("[MQTT] Error:", err.message);
      setMqttStatus("error");
      setError(`MQTT error: ${err.message}`);
    });

    // ── Offline / closed ─────────────────────────────────────────────────────
    client.on("offline", () => {
      console.warn("[MQTT] Went offline");
      setMqttStatus("disconnected");
      scheduleRetry();
    });

    client.on("close", () => {
      if (clientRef.current) setMqttStatus("disconnected");
    });

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Exponential back-off retry ────────────────────────────────────────────
  const scheduleRetry = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) {
      setMqttStatus("error");
      setError("Could not connect to real-time sensor. Using REST polling fallback.");
      return;
    }
    const delay = Math.min(2 ** retryCountRef.current * 2_000, 30_000);
    retryCountRef.current += 1;
    console.log(`[MQTT] Retry in ${delay / 1000}s (${retryCountRef.current}/${MAX_RETRIES})`);
    retryTimerRef.current = setTimeout(connectMqtt, delay);
  }, [connectMqtt]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchParkingData();
    pollIntervalRef.current = setInterval(fetchParkingData, 5_000);

    return () => {
      if (retryTimerRef.current)   clearTimeout(retryTimerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (clientRef.current) { clientRef.current.end(true); clientRef.current = null; }
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchParkingData();
  }, [fetchParkingData]);

  return (
    <ParkingContext.Provider value={{ parkings, loading, error, mqttStatus, lastUpdated, refetch }}>
      {children}
    </ParkingContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useParking = (): ParkingContextType => {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParking must be used inside <ParkingProvider>.");
  return ctx;
};
