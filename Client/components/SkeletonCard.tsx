export default function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 14, padding: "14px 16px",
      boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div className="skeleton" style={{ height: 14, width: 110 }}/>
        <div className="skeleton" style={{ height: 20, width: 68, borderRadius: 99 }}/>
      </div>
      <div className="skeleton" style={{ height: 11, width: 90, marginBottom: 12 }}/>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div className="skeleton" style={{ flex: 1, height: 42, borderRadius: 10 }}/>
        <div className="skeleton" style={{ flex: 1, height: 42, borderRadius: 10 }}/>
      </div>
      <div className="skeleton" style={{ height: 5, borderRadius: 99, marginBottom: 12 }}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 9 }}/>)}
      </div>
    </div>
  );
}