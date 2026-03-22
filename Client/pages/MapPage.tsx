import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { useParking } from "../context/ParkingContext";
import MapView from "../components/MapView";

export default function MapPage() {
  const navigate = useNavigate();
  const { parkings } = useParking();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f8fafc", overflowX: "hidden", width: "100%" }}>

      {/* ── Top bar ── */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        gap:            10,
        padding:        "12px 16px 12px 16px",
        margin:         "0",
        boxSizing:      "border-box",
        width:          "100%",
        background:     "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom:   "1px solid #e2e8f0",
        boxShadow:      "0 1px 4px rgba(15,23,42,0.06)",
        flexShrink:     0,
        zIndex:         10,
      }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            width:          36,
            height:         36,
            borderRadius:   10,
            border:         "1px solid #e2e8f0",
            background:     "#fff",
            cursor:         "pointer",
            flexShrink:     0,
            boxShadow:      "0 1px 3px rgba(15,23,42,0.07)",
          }}
        >
          <ArrowLeft size={17} color="#374151" />
        </button>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize:   15,
            color:      "#0f172a",
            lineHeight: 1.2,
          }}>
            Parking Map
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
            {parkings.length} location{parkings.length !== 1 ? "s" : ""} tracked
          </div>
        </div>

        {/* Live badge */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          5,
          padding:      "5px 10px",
          borderRadius: 99,
          background:   "#ecfdf5",
          border:       "1px solid #a7f3d0",
          fontSize:     11,
          fontWeight:   600,
          color:        "#059669",
        }}>
          <span style={{
            position: "relative", display: "flex", width: 7, height: 7,
          }}>
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "#10b981", animation: "ping 1.2s ease-out infinite",
            }} />
            <span style={{
              position: "relative", width: 7, height: 7,
              borderRadius: "50%", background: "#10b981", display: "block",
            }} />
          </span>
          <MapPin size={11} />
          Live
        </div>
      </div>

      {/* ── Full-screen map ── */}
      <div style={{ flex: 1, overflow: "hidden", padding: 10 }}>
        <MapView data={parkings} />
      </div>

      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.8; }
          75%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}