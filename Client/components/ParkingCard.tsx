import type { Parking } from "../types/parking";
import StatusBadge from "./StatusBadge";
import { MapPin, Satellite } from "lucide-react";

export default function ParkingCard({ data }: { data: Parking }) {
  const pct      = data.totalSlots > 0 ? Math.round((data.occupiedSlots / data.totalSlots) * 100) : 0;
  const barColor = pct > 70 ? "#dc2626" : pct > 40 ? "#d97706" : "#059669";

  // Use slot1/slot2 directly from backend for accurate per-slot status
  const slots = [data.slot1, data.slot2] as const;

  // GPS display: show coordinates only when we have a real fix
  const lat = data.gpsFixed ? data.location.lat.toFixed(4) : null;
  const lng = data.gpsFixed ? data.location.lng.toFixed(4) : null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
        transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow   = "0 8px 24px rgba(15,23,42,0.11)";
        el.style.transform   = "translateY(-2px)";
        el.style.borderColor = "#93c5fd";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow   = "0 1px 4px rgba(15,23,42,0.06)";
        el.style.transform   = "translateY(0)";
        el.style.borderColor = "#e2e8f0";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 8 }}>
        <div style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
        }}>
          {data.name}
        </div>
        <StatusBadge available={data.availableSlots} total={data.totalSlots} />
      </div>

      {/* Location row */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
        {data.gpsFixed ? (
          <>
            <MapPin size={11} style={{ color: "#059669", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lat}, {lng}
            </span>
          </>
        ) : (
          <>
            <Satellite size={11} style={{ color: "#d97706", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#d97706" }}>
              Waiting for GPS fix…
            </span>
          </>
        )}
      </div>

      {/* Slot boxes — driven by slot1/slot2 from backend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {slots.map((slot, i) => {
          const occupied = slot === "OCCUPIED";
          return (
            <div
              key={i}
              className={occupied ? "slot-occupied" : ""}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                background: occupied ? "#fef2f2" : "#ecfdf5",
                border: `1.5px solid ${occupied ? "#fca5a5" : "#a7f3d0"}`,
                color: occupied ? "#dc2626" : "#059669",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {i + 1}
              {occupied && (
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "repeating-linear-gradient(45deg,#dc262615 0px,#dc262615 2px,transparent 2px,transparent 8px)",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`, background: barColor,
            borderRadius: 99, transition: "width 0.8s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Utilization</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>{pct}%</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Total", value: data.totalSlots,     color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "Free",  value: data.availableSlots, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
          { label: "Used",  value: data.occupiedSlots,  color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 9, padding: "8px 4px", textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
