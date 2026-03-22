interface Props { available: number; total?: number; }

export default function StatusBadge({ available, total = 2 }: Props) {
  const pct = total > 0 ? (available / total) * 100 : 0;
  const cfg = available === 0
    ? { label: "Full",        color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" }
    : pct <= 30
    ? { label: "Almost Full", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" }
    : { label: "Available",   color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: 11, fontWeight: 600,
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }}/>
      {cfg.label}
    </span>
  );
}