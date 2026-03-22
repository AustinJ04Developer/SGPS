interface Props { available: number; total?: number; }

export default function SlotIndicator({ available, total = 2 }: Props) {
  const pct = total > 0 ? (available / total) * 100 : 0;
  const cfg = available === 0
    ? { label: "Parking Full",      icon: "🚫", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" }
    : pct <= 30
    ? { label: "Almost Full",       icon: "⚠️", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" }
    : { label: "Parking Available", icon: "✅", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      padding: "8px 16px", borderRadius: 10,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: 13, fontWeight: 600,
      animation: available === 0 ? "slotBlink 1.8s ease-in-out infinite" : "none",
    }}>
      <span>{cfg.icon}</span>{cfg.label}
    </div>
  );
}