import { useParking } from "../context/ParkingContext";
import ParkingCard   from "../components/ParkingCard";
import MapView       from "../components/MapView";
import KpiCards      from "../components/KpiCards";
import SkeletonCard  from "../components/SkeletonCard";
import PageWrapper   from "../components/PageWrapper";
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Loader2, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { parkings, loading, error, refetch, mqttStatus } = useParking();
  const navigate = useNavigate();

  const totalSlots     = parkings.reduce((s, p) => s + p.totalSlots,     0);
  const availableSlots = parkings.reduce((s, p) => s + p.availableSlots, 0);
  const occupiedSlots  = parkings.reduce((s, p) => s + p.occupiedSlots,  0);

  const streamBadge = {
    connected:    { label: "Live Stream Active", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0",  Icon: Wifi,          ping: true,  spin: false },
    connecting:   { label: "Connecting…",        color: "#d97706", bg: "#fffbeb", border: "#fcd34d",  Icon: Loader2,       ping: false, spin: true  },
    disconnected: { label: "Stream Offline",      color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1",  Icon: WifiOff,       ping: false, spin: false },
    error:        { label: "Stream Error",        color: "#dc2626", bg: "#fef2f2", border: "#fca5a5",  Icon: AlertTriangle, ping: false, spin: false },
  }[mqttStatus];

  /* ── LOADING ── */
  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14 }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SkeletonCard /><SkeletonCard />
            </div>
            <div className="skeleton" style={{ height: 520, borderRadius: 14 }} />
          </div>
        </div>
      </PageWrapper>
    );
  }

  /* ── ERROR ── */
  if (error && !parkings.length) {
    return (
      <PageWrapper>
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "60vh", textAlign: "center",
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: "#fef2f2", border: "1px solid #fca5a5",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 18,
          }}>
            <AlertTriangle size={30} style={{ color: "#dc2626" }} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#0f172a", marginBottom: 8 }}>
            Failed to Load Data
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", maxWidth: 340, lineHeight: 1.6, marginBottom: 22 }}>
            {error}
          </p>
          <button onClick={refetch} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 20px", borderRadius: 99,
            background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
            color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}>
            <RefreshCw size={13} /> Try Again
          </button>
        </div>
      </PageWrapper>
    );
  }

  /* ── EMPTY ── */
  if (!parkings.length) {
    return (
      <PageWrapper>
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "60vh", textAlign: "center",
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, marginBottom: 18,
          }}>
            🅿️
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#0f172a", marginBottom: 8 }}>
            No Parking Data Yet
          </h2>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
            Awaiting connection from ESP32 or backend…
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 16px", borderRadius: 99,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            color: "#2563eb", fontSize: 13, fontWeight: 600,
          }}>
            <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
            Listening for data…
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageWrapper>
    );
  }

  /* ── MAIN ── */
  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Soft error banner */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 11,
            background: "#fffbeb", border: "1px solid #fcd34d",
          }}>
            <AlertTriangle size={15} style={{ color: "#d97706", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#92400e", flex: 1 }}>{error}</span>
            <button onClick={refetch} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 99,
              background: "#d97706", color: "#fff",
              border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}

        {/* Page header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 800,
              fontSize: 22, color: "#0f172a", lineHeight: 1.2,
            }}>
              Parking Overview
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
              Monitoring {parkings.length} location{parkings.length !== 1 ? "s" : ""} in real-time
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Mobile-only: View Map header button */}
            <button
              onClick={() => navigate("/map")}
              className="mobile-map-btn"
              style={{
                display:    "none",
                alignItems: "center",
                gap:        6,
                padding:    "6px 14px",
                borderRadius: 99,
                background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                color:      "#fff",
                border:     "none",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize:   12,
                cursor:     "pointer",
                boxShadow:  "0 3px 12px rgba(37,99,235,0.28)",
                whiteSpace: "nowrap",
              }}
            >
              <Map size={13} />
              View Map
            </button>

            {/* Stream status badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 99,
              background: streamBadge.bg,
              border: `1px solid ${streamBadge.border}`,
              fontSize: 12, fontWeight: 600, color: streamBadge.color,
              transition: "all 0.3s ease",
            }}>
              {streamBadge.ping && (
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
              <streamBadge.Icon
                size={13}
                style={{
                  color: streamBadge.color,
                  animation: streamBadge.spin ? "spin 1s linear infinite" : "none",
                }}
              />
              {streamBadge.label}
            </div>
          </div>
        </div>

        {/* KPI row */}
        <KpiCards
          total={totalSlots}
          available={availableSlots}
          occupied={occupiedSlots}
        />

        {/* Main grid */}
        <div className="dashboard-grid" style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 16,
          alignItems: "stretch",
        }}>
          {/* LEFT: card list */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 12,
            overflowY: "auto", maxHeight: "calc(100vh - 260px)", paddingRight: 4,
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "0 2px",
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8",
              }}>
                Locations
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "2px 9px", borderRadius: 99,
                background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb",
              }}>
                {parkings.length}
              </span>
            </div>

            {parkings.map((p, i) => (
              <div
                key={p._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <ParkingCard data={p} />
              </div>
            ))}

          </div>

          {/* RIGHT: map — hidden on mobile */}
          <div className="dashboard-map-col" style={{ minHeight: 480, height: "calc(100vh - 260px)" }}>
            <MapView data={parkings} />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 767px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-map-col {
            display: none !important;
          }
          .mobile-map-btn {
            display: flex !important;
          }

        }
      `}</style>
    </PageWrapper>
  );
}