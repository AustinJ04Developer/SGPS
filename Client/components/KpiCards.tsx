import { useEffect, useState } from "react";
import { Car, CheckCircle2, XCircle, Activity } from "lucide-react";

interface Props { total: number; available: number; occupied: number; }

function Counter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const steps = 40, ms = 16;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setN(Math.round((i / steps) * value));
      if (i >= steps) clearInterval(iv);
    }, ms);
    return () => clearInterval(iv);
  }, [value]);
  return <>{n}</>;
}

const CARDS = [
  { key: "total"     as const, label: "Total Slots", Icon: Car,          color: "#2563eb", iconBg: "#dbeafe", border: "#bfdbfe" },
  { key: "available" as const, label: "Available",   Icon: CheckCircle2, color: "#059669", iconBg: "#d1fae5", border: "#a7f3d0" },
  { key: "occupied"  as const, label: "Occupied",    Icon: XCircle,      color: "#dc2626", iconBg: "#fee2e2", border: "#fca5a5" },
];

export default function KpiCards({ total, available, occupied }: Props) {
  const vals = { total, available, occupied };
  const pct  = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const barColor  = pct > 70 ? "#dc2626" : pct > 40 ? "#d97706" : "#059669";
  const barBorder = pct > 70 ? "#fca5a5" : pct > 40 ? "#fcd34d" : "#a7f3d0";
  const barIconBg = pct > 70 ? "#fee2e2" : pct > 40 ? "#fef3c7" : "#d1fae5";

  return (
    <div style={{
      display: "grid",
      /* 2 cols on mobile, 4 cols on md+ */
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 10,
    }}
    className="kpi-grid"
    >
      <style>{`
        @media (min-width: 640px)  { .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 12px !important; } }
        @media (min-width: 1024px) { .kpi-grid { gap: 14px !important; } }
      `}</style>

      {CARDS.map(({ key, label, Icon, color, iconBg, border }, i) => (
        <div key={key}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${i * 60}ms`,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
            cursor: "default",
            minWidth: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.boxShadow   = "0 6px 20px rgba(15,23,42,0.1)";
            el.style.transform   = "translateY(-2px)";
            el.style.borderColor = border;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.boxShadow   = "0 1px 4px rgba(15,23,42,0.06)";
            el.style.transform   = "translateY(0)";
            el.style.borderColor = "#e2e8f0";
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon size={18} style={{ color }}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2, whiteSpace: "nowrap" }}>
              {label}
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 24, color, lineHeight: 1 }}>
              <Counter value={vals[key]}/>
            </div>
          </div>
        </div>
      ))}

      {/* Occupancy — spans 2 cols on mobile so it's centred */}
      <div
        className="animate-fade-in-up occ-card"
        style={{
          animationDelay: "180ms",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: "14px 16px",
          boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
          cursor: "default",
          minWidth: 0,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow   = "0 6px 20px rgba(15,23,42,0.1)";
          el.style.transform   = "translateY(-2px)";
          el.style.borderColor = barBorder;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow   = "0 1px 4px rgba(15,23,42,0.06)";
          el.style.transform   = "translateY(0)";
          el.style.borderColor = "#e2e8f0";
        }}
      >
        <style>{`
          @media (max-width: 639px) { .occ-card { grid-column: span 2; } }
        `}</style>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: barIconBg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Activity size={18} style={{ color: barColor }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
            Occupancy
          </div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 24, color: barColor, lineHeight: 1, marginBottom: 6 }}>
            {pct}%
          </div>
          <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, background: barColor,
              borderRadius: 99, transition: "width 1s ease",
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}