import mqtt from "mqtt";
import dotenv from "dotenv";
import Parking from "../models/Parking";

dotenv.config();

const host     = process.env.HIVEMQ_HOST!;
const port     = process.env.HIVEMQ_PORT!;
const username = process.env.HIVEMQ_USERNAME!;
const password = process.env.HIVEMQ_PASSWORD!;

const parkingTopic  = process.env.MQTT_TOPIC_PARKING_STATUS || "smartparking/status";
const commandsTopic = process.env.MQTT_TOPIC_COMMANDS       || "smartparking/commands";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true only when lat/lng are real coordinates (not 0,0 "Null Island").
 * Allows a tiny epsilon so floating-point 0.000001 doesn't sneak through.
 */
function isValidGPS(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    !(Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) && // reject (0,0)
    lat  >= -90  && lat  <= 90  &&
    lng  >= -180 && lng  <= 180
  );
}

// ─── MQTT client ─────────────────────────────────────────────────────────────

export const client = mqtt.connect(`mqtts://${host}:${port}`, {
  username,
  password,
  rejectUnauthorized: false, // skip cert verification for HiveMQ Cloud testing
  reconnectPeriod: 5000,     // auto-reconnect every 5 s
  connectTimeout: 10000,
});

client.on("connect", () => {
  console.log("✅ MQTT connected to HiveMQ Cloud");
  client.subscribe([parkingTopic, commandsTopic], (err) => {
    if (err) {
      console.error("❌ MQTT subscribe error:", err.message);
    } else {
      console.log(`✅ Subscribed: ${parkingTopic}, ${commandsTopic}`);
    }
  });
});

client.on("reconnect", () => console.log("🔄 MQTT reconnecting..."));
client.on("offline",   () => console.warn("⚠️  MQTT offline"));
client.on("error",     (err) => console.error("❌ MQTT error:", err.message));

// ─── Message handler ─────────────────────────────────────────────────────────

client.on("message", async (topic, rawMessage) => {
  const msg = rawMessage.toString().trim();

  // ── Parking status from ESP32 ──────────────────────────────────────────────
  if (topic === parkingTopic) {
    let data: any;

    // 1. Parse JSON safely
    try {
      data = JSON.parse(msg);
    } catch {
      console.error("❌ Invalid JSON from ESP32:", msg);
      return;
    }

    // 2. Validate required fields
    if (!data.deviceId) {
      console.error("❌ Missing deviceId in payload:", data);
      return;
    }

    // 3. Slot status
    const slot1 = data.slot1 === "OCCUPIED" ? "OCCUPIED" : "FREE";
    const slot2 = data.slot2 === "OCCUPIED" ? "OCCUPIED" : "FREE";
    const occupiedSlots = (slot1 === "OCCUPIED" ? 1 : 0) + (slot2 === "OCCUPIED" ? 1 : 0);
    const totalSlots    = typeof data.totalSlots === "number" ? data.totalSlots : 2;

    // 4. GPS — only update stored coordinates when ESP32 confirms a valid fix
    //    and the values are sane. Keep old coordinates if this message has no fix.
    const incomingLat  = parseFloat(data.lat);
    const incomingLng  = parseFloat(data.lng);
    const incomingFix  = data.gpsFixed === true || data.gpsFixed === "true";
    const gpsValid     = incomingFix && isValidGPS(incomingLat, incomingLng);

    // 5. Upsert into MongoDB
    try {
      let parking = await Parking.findOne({ deviceId: data.deviceId });

      if (parking) {
        // Update slot data always
        parking.slot1         = slot1;
        parking.slot2         = slot2;
        parking.occupiedSlots = occupiedSlots;
        parking.totalSlots    = totalSlots;
        parking.name          = data.name || parking.name;
        parking.lastUpdated   = new Date();

        // Only overwrite GPS if the new reading is valid
        if (gpsValid) {
          parking.location = { lat: incomingLat, lng: incomingLng };
          parking.gpsFixed = true;
        }
        // If no fix yet and we never had one, mark explicitly
        if (!gpsValid && !parking.gpsFixed) {
          parking.gpsFixed = false;
        }

        await parking.save();
        console.log(
          `✅ Updated [${data.deviceId}] | ${slot1} / ${slot2} | ` +
          `GPS: ${gpsValid ? `${incomingLat.toFixed(6)}, ${incomingLng.toFixed(6)}` : "no fix"}`
        );
      } else {
        // First time seeing this device
        parking = await Parking.create({
          deviceId:      data.deviceId,
          name:          data.name || "Smart Parking",
          slot1,
          slot2,
          occupiedSlots,
          totalSlots,
          gpsFixed:      gpsValid,
          location: {
            lat: gpsValid ? incomingLat : 0,
            lng: gpsValid ? incomingLng : 0,
          },
        });
        console.log(`✅ Created new parking [${data.deviceId}]`);
      }
    } catch (err: any) {
      console.error("❌ MongoDB upsert error:", err.message);
    }
  }

  // ── Commands topic ─────────────────────────────────────────────────────────
  if (topic === commandsTopic) {
    console.log(`📩 Command received: ${msg}`);
    // Forward to a specific device topic if needed:
    // client.publish(`smartparking/${deviceId}/command`, msg);
  }
});
