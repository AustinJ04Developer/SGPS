import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import type { Parking } from "../types/parking";

export default function MapView({ data }: { data: Parking[] }) {
  const [selected, setSelected] = useState<Parking | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Only use locations that have a real GPS fix
  const mappable = data.filter(p => p.gpsFixed && p.location.lat !== 0 && p.location.lng !== 0);

  // Default center: first mappable location, or Madurai as fallback
  const center = mappable.length > 0
    ? { lat: mappable[0].location.lat, lng: mappable[0].location.lng }
    : { lat: 9.9252, lng: 78.1198 };

  useEffect(() => {
    if (mapRef.current && mappable.length > 0) {
      mapRef.current.panTo({ lat: mappable[0].location.lat, lng: mappable[0].location.lng });
    }
  }, [mappable]);

  // Sync mapType state → actual map instance
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  const freeCount   = mappable.filter(p => p.availableSlots > 0 && (p.availableSlots / p.totalSlots) * 100 > 30).length;
  const almostCount = mappable.filter(p => p.availableSlots > 0 && (p.availableSlots / p.totalSlots) * 100 <= 30).length;
  const fullCount   = mappable.filter(p => p.availableSlots === 0).length;

  const makeIcon = (parking: Parking): google.maps.Icon => {
    const pct      = parking.totalSlots > 0 ? (parking.availableSlots / parking.totalSlots) * 100 : 0;
    const isFull   = parking.availableSlots === 0;
    const isAlmost = !isFull && pct <= 30;
    const fill     = isFull ? "#dc2626" : isAlmost ? "#d97706" : "#059669";
    const dark     = isFull ? "#991b1b" : isAlmost ? "#92400e" : "#065f46";
    const label    = isFull ? "P" : parking.availableSlots.toString();

    const svg = `<svg width="46" height="56" viewBox="0 0 46 56" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="23" cy="53" rx="10" ry="3.5" fill="rgba(0,0,0,0.15)"/>
  <path d="M23 2C12.51 2 4 10.51 4 21c0 14.25 19 33 19 33S42 35.25 42 21C42 10.51 33.49 2 23 2z"
        fill="${fill}" stroke="${dark}" stroke-width="1.5"/>
  <circle cx="23" cy="21" r="11" fill="white" opacity="0.93"/>
  <text x="23" y="26" text-anchor="middle"
        font-family="Outfit,sans-serif" font-weight="800" font-size="${label.length > 1 ? 11 : 13}"
        fill="${fill}">${label}</text>
</svg>`;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(46, 56),
      anchor:     new google.maps.Point(23, 56),
    };
  };

  if (!isLoaded) {
    return (
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "3px solid #bfdbfe", borderTopColor: "#2563eb",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading map…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: "relative", height: "100%", width: "100%",
      borderRadius: 14, overflow: "hidden",
      border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(15,23,42,0.07)",
    }}>
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        center={center}
        zoom={mappable.length > 0 ? 15 : 12}
        mapTypeId={mapType}
        onLoad={map => { mapRef.current = map; }}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
          styles: mapType === "roadmap" ? [
            { featureType: "poi",     stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "simplified" }] },
          ] : [],
        }}
      >
        {/* Only render markers for devices that have a valid GPS fix */}
        {mappable.map(p => (
          <Marker
            key={p._id}
            position={{ lat: p.location.lat, lng: p.location.lng }}
            icon={makeIcon(p)}
            onClick={() => setSelected(p)}
            title={`${p.name} — ${p.availableSlots} slot${p.availableSlots !== 1 ? "s" : ""} free`}
          />
        ))}

        {selected && selected.gpsFixed && (
          <InfoWindow
            position={{ lat: selected.location.lat, lng: selected.location.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{
              padding: "12px 15px", minWidth: 165,
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                fontSize: 14, color: "#0f172a", marginBottom: 10,
              }}>
                {selected.name}
              </div>

              {/* Per-slot boxes using slot1/slot2 from backend */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {([selected.slot1, selected.slot2] as const).map((slot, i) => {
                  const occ = slot === "OCCUPIED";
                  return (
                    <div key={i} style={{
                      flex: 1, height: 34, borderRadius: 7,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13,
                      background: occ ? "#fef2f2" : "#ecfdf5",
                      border: `1.5px solid ${occ ? "#fca5a5" : "#a7f3d0"}`,
                      color: occ ? "#dc2626" : "#059669",
                    }}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>

              {[
                { label: "Available", value: selected.availableSlots, color: "#059669", bg: "#ecfdf5" },
                { label: "Occupied",  value: selected.occupiedSlots,  color: "#dc2626", bg: "#fef2f2" },
                { label: "Total",     value: selected.totalSlots,     color: "#2563eb", bg: "#eff6ff" },
              ].map(r => (
                <div key={r.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "4px 0", borderBottom: "1px solid #f1f5f9",
                }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{r.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: r.color,
                    background: r.bg, padding: "1px 8px", borderRadius: 99,
                  }}>
                    {r.value}
                  </span>
                </div>
              ))}

              {/* GPS coordinates */}
              <div style={{
                marginTop: 8, fontSize: 10, color: "#94a3b8",
                fontFamily: "monospace",
              }}>
                {selected.location.lat.toFixed(6)}, {selected.location.lng.toFixed(6)}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Top overlay — desktop: one row; mobile: stacked (toggle above tracked) */}
      <div className="map-overlay" style={{
        position: "absolute", top: 10, left: 10, right: 10,
        pointerEvents: "none",
      }}>

        {/* Map type toggle */}
        <div className="map-toggle-row" style={{ pointerEvents: "auto" }}>
          <div style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.96)", backdropFilter: "blur(8px)",
            border: "1px solid #e2e8f0", borderRadius: 99,
            boxShadow: "0 1px 4px rgba(15,23,42,0.10)",
            padding: 3, gap: 2,
          }}>
            {(["roadmap", "satellite"] as const).map(type => {
              const active = mapType === type;
              const icon  = type === "roadmap" ? "🗺️" : "🛰️";
              const label = type === "roadmap" ? "Map" : "Satellite";
              return (
                <button
                  key={type}
                  onClick={() => setMapType(type)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 11px", borderRadius: 99,
                    border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 700,
                    transition: "all 0.18s ease",
                    background: active ? "#2563eb" : "transparent",
                    color: active ? "#fff" : "#64748b",
                    boxShadow: active ? "0 1px 4px rgba(37,99,235,0.25)" : "none",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tracked count badge */}
        <div className="map-tracked-row">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 11px", borderRadius: 99,
            background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)",
            border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
            fontSize: 11, fontWeight: 600, color: "#475569",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#059669", boxShadow: "0 0 0 2px #d1fae5", flexShrink: 0,
            }} />
            {data.length} location{data.length !== 1 ? "s" : ""} tracked
            {mappable.length < data.length && (
              <span style={{ marginLeft: 4, color: "#d97706", fontSize: 10 }}>
                ({data.length - mappable.length} awaiting GPS)
              </span>
            )}
          </div>
        </div>

        {/* GPS pending notice */}
        {data.some(p => !p.gpsFixed) && (
          <div className="map-gps-row" style={{ pointerEvents: "auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 11px", borderRadius: 99,
              background: "#fffbeb", backdropFilter: "blur(8px)",
              border: "1px solid #fcd34d",
              fontSize: 11, fontWeight: 600, color: "#d97706",
            }}>
              ⏳ GPS fix pending…
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ── Desktop: all items in one row, tracked left · toggle right ── */
        @media (min-width: 768px) {
          .map-overlay {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
          }
          .map-tracked-row { order: 1; }
          .map-toggle-row  { order: 2; margin-left: auto; }
          .map-gps-row     { order: 3; }
        }

        /* ── Mobile: stacked column, toggle first then tracked ── */
        @media (max-width: 767px) {
          .map-overlay {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .map-toggle-row  { order: 1; align-self: flex-end; }
          .map-tracked-row { order: 2; }
          .map-gps-row     { order: 3; align-self: flex-end; }
        }
      `}</style>

      {/* Bottom-left: legend */}
      <div style={{
        position: "absolute", bottom: 40, left: 12,
        display: "flex", flexDirection: "column", gap: 7,
        padding: "11px 14px", borderRadius: 13,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(15,23,42,0.1)",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.07em", color: "#94a3b8", marginBottom: 2,
        }}>
          Marker Legend
        </div>
        {([
          { fill: "#059669", dark: "#065f46", label: "Free Parking",   count: freeCount   },
          { fill: "#d97706", dark: "#92400e", label: "Almost Full",    count: almostCount },
          { fill: "#dc2626", dark: "#991b1b", label: "Fully Occupied", count: fullCount   },
        ] as const).map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <svg width="14" height="17" viewBox="0 0 46 56" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M23 2C12.51 2 4 10.51 4 21c0 14.25 19 33 19 33S42 35.25 42 21C42 10.51 33.49 2 23 2z"
                    fill={item.fill} stroke={item.dark} strokeWidth="1.5"/>
              <circle cx="23" cy="21" r="11" fill="white" opacity="0.9"/>
            </svg>
            <span style={{ fontSize: 12, color: "#374151", fontWeight: 500, flex: 1, whiteSpace: "nowrap" }}>
              {item.label}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: item.fill,
              background: item.fill + "15", border: `1px solid ${item.fill}40`,
              padding: "1px 7px", borderRadius: 99, minWidth: 22, textAlign: "center",
            }}>
              {item.count}
            </span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 6, marginTop: 2 }}>
          <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4 }}>
            Number inside pin = free slots
          </div>
        </div>
      </div>
    </div>
  );
}