import { WifiOff, AlertTriangle, Loader2, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useParking } from "../context/ParkingContext";

export default function Navbar() {
  const [time, setTime]                 = useState(new Date());
  const { mqttStatus, lastUpdated }     = useParking();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const fmtLastUpdated = (d: Date) => {
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec <  5)  return "just now";
    if (diffSec < 60)  return `${diffSec}s ago`;
    return `${Math.floor(diffSec / 60)}m ago`;
  };

  const mqttChip = {
    connecting:   { label: "Connecting…",  color: "#d97706", bg: "#fffbeb", border: "#fcd34d", Icon: Loader2,       spin: true  },
    connected:    { label: "Live",         color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", Icon: Wifi,          spin: false },
    disconnected: { label: "Offline",      color: "#64748b", bg: "#f8fafc", border: "#cbd5e1", Icon: WifiOff,       spin: false },
    error:        { label: "Sensor Error", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", Icon: AlertTriangle, spin: false },
  }[mqttStatus];

  const MqttChip = (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 99,
      background: mqttChip.bg,
      border: `1px solid ${mqttChip.border}`,
      transition: "all 0.3s ease",
      flexShrink: 0,
    }}>
      {mqttStatus === "connected" && (
        <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
          <span className="status-ping" style={{
            position: "absolute", inset: 0,
            borderRadius: "50%", background: "#10b981",
          }} />
          <span style={{
            position: "relative", width: 8, height: 8,
            borderRadius: "50%", background: "#10b981", display: "block",
          }} />
        </span>
      )}
      <mqttChip.Icon
        size={13}
        style={{ color: mqttChip.color, animation: mqttChip.spin ? "spin 1s linear infinite" : "none" }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: mqttChip.color }}>
        {mqttChip.label}
      </span>
    </div>
  );

  const BrandLogo = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(37,99,235,0.32)", flexShrink: 0,
      }}>
        <svg width="26" height="26" viewBox="0 0 680 560" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="140" r="10" fill="white" opacity="0.2"/>
          <circle cx="490" cy="105" r="8" fill="white" opacity="0.15"/>
          <path d="M70 280 L70 245 L130 245" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
          <path d="M410 455 L490 455 L490 420 L560 420" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.45"/>
          <path d="M240 175 L240 228" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" opacity="0.55"/>
          <path d="M126 91 L175 91 L175 175 L240 175" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          <path d="M152 355 L152 308 L200 268 L520 268 L565 308 L565 355 Z" fill="white" opacity="0.92"/>
          <path d="M207 268 L242 228 L455 228 L495 268 Z" fill="white" opacity="0.72"/>
          <path d="M248 231 L268 268 L370 268 L370 231 Z" fill="white" opacity="0.35"/>
          <ellipse cx="472" cy="383" rx="40" ry="28" fill="white" opacity="0.88"/>
          <ellipse cx="472" cy="383" rx="18" ry="12" fill="white" opacity="0.4"/>
          <ellipse cx="265" cy="383" rx="40" ry="28" fill="white" opacity="0.88"/>
          <ellipse cx="265" cy="383" rx="18" ry="12" fill="white" opacity="0.4"/>
          <ellipse cx="350" cy="228" rx="26" ry="13" fill="white" opacity="0.65"/>
          <ellipse cx="350" cy="224" rx="13" ry="7" fill="white" opacity="0.45"/>
          <path d="M328 216 Q350 194 372 216" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" opacity="0.8"/>
          <path d="M312 205 Q350 176 388 205" fill="none" stroke="white" strokeWidth="17" strokeLinecap="round" opacity="0.5"/>
          <path d="M296 194 Q350 157 404 194" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round" opacity="0.28"/>
          <rect x="56" y="56" width="70" height="70" rx="10" fill="white" opacity="0.22"/>
          <rect x="64" y="64" width="54" height="54" rx="7" fill="none" stroke="white" strokeWidth="14" opacity="0.65"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a", lineHeight: 1.2 }}>
          SmartPark
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1 }}>
          Real-time Monitoring
        </div>
      </div>
    </div>
  );

  return (
    <header style={{
      background:     "rgba(255,255,255,0.88)",
      backdropFilter: "blur(16px)",
      borderBottom:   "1px solid #e2e8f0",
      boxShadow:      "0 1px 4px rgba(15,23,42,0.06)",
      position:       "sticky",
      top: 0,
      zIndex: 50,
    }}>

      {/* ── Desktop layout: single row ── */}
      <div className="navbar-desktop" style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 24px",
        height: 62, display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>
        {BrandLogo}

        {/* Clock */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            fontSize: 18, color: "#2563eb", letterSpacing: "0.06em", lineHeight: 1.2,
          }}>
            {fmtTime(time)}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtDate(time)}</div>
        </div>

        {/* Right: last updated + MQTT */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastUpdated && (
            <div style={{
              fontSize: 11, color: "#94a3b8",
              padding: "4px 10px", borderRadius: 99,
              background: "#f8fafc", border: "1px solid #e2e8f0", whiteSpace: "nowrap",
            }}>
              Updated {fmtLastUpdated(lastUpdated)}
            </div>
          )}
          {MqttChip}
        </div>
      </div>

      {/* ── Mobile layout: two compact rows ── */}
      <div className="navbar-mobile" style={{ padding: "8px 14px 8px", display: "none" }}>

        {/* Row 1: Brand + MQTT chip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {BrandLogo}
          {MqttChip}
        </div>

        {/* Row 2: Clock + last updated */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 6, paddingTop: 6, borderTop: "1px solid #f1f5f9",
        }}>
          {/* Clock compact */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
              fontSize: 15, color: "#2563eb", letterSpacing: "0.04em",
            }}>
              {fmtTime(time)}
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{fmtDate(time)}</span>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div style={{
              fontSize: 10, color: "#94a3b8",
              padding: "3px 8px", borderRadius: 99,
              background: "#f8fafc", border: "1px solid #e2e8f0", whiteSpace: "nowrap",
            }}>
              Updated {fmtLastUpdated(lastUpdated)}
            </div>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {mqttStatus === "error" && (
        <div style={{
          background: "#fef2f2", borderTop: "1px solid #fca5a5",
          padding: "7px 16px", display: "flex", alignItems: "center",
          gap: 8, fontSize: 12, color: "#dc2626", fontWeight: 500,
        }}>
          <AlertTriangle size={13} style={{ flexShrink: 0 }} />
          Sensor unreachable. Showing last known data. Polling every 15s.
        </div>
      )}

      {/* ── Disconnected banner ── */}
      {mqttStatus === "disconnected" && (
        <div style={{
          background: "#f8fafc", borderTop: "1px solid #cbd5e1",
          padding: "7px 16px", display: "flex", alignItems: "center",
          gap: 8, fontSize: 12, color: "#475569", fontWeight: 500,
        }}>
          <WifiOff size={13} style={{ flexShrink: 0 }} />
          Connection lost. Data may be stale.
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 767px) {
          .navbar-desktop { display: none !important; }
          .navbar-mobile  { display: block !important; }
        }
      `}</style>
    </header>
  );
}