import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const navigate  = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Animated grid-dot background */
  useEffect(() => {
    const canvas  = canvasRef.current;
    if (!canvas) return;
    const ctx     = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const spacing = 36;
      const cols = Math.ceil(W / spacing) + 1;
      const rows = Math.ceil(H / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x   = c * spacing;
          const y   = r * spacing;
          const dx  = x - W / 2;
          const dy  = y - H / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.sin(dist / 55 - t * 0.018) * 0.5 + 0.5;
          const alpha = wave * 0.13 + 0.03;
          const radius = wave * 1.6 + 0.6;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.fill();
        }
      }
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{
      position:   "relative",
      minHeight:  "100vh",
      display:    "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      overflow:   "hidden",
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* Animated dot-grid canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Blurred blue glow orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "20%",
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%",
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        position:   "relative",
        zIndex:     1,
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign:  "center",
        padding:    "52px 56px 48px",
        borderRadius: 28,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(20px)",
        border:     "1px solid rgba(226,232,240,0.9)",
        boxShadow:  "0 8px 48px rgba(15,23,42,0.10), 0 1px 0 rgba(255,255,255,0.9) inset",
        maxWidth:   480,
        width:      "90vw",
        animation:  "fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both",
      }}>

        {/* Parking icon with "P" and slash */}
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(37,99,235,0.30)",
          marginBottom: 28,
          position: "relative",
          animation: "popIn 0.5s 0.15s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* P letter */}
            <text x="9" y="32" fontFamily="Outfit, sans-serif" fontWeight="800"
                  fontSize="28" fill="white" opacity="0.95">P</text>
            {/* Diagonal slash */}
            <line x1="8" y1="38" x2="36" y2="8" stroke="white" strokeWidth="3.5"
                  strokeLinecap="round" opacity="0.9"/>
          </svg>
        </div>

        {/* 404 number */}
        <div style={{
          fontFamily:    "'Outfit', sans-serif",
          fontWeight:    800,
          fontSize:      72,
          lineHeight:    1,
          background:    "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          letterSpacing: "-0.03em",
          marginBottom:  8,
          animation:     "fadeUp 0.5s 0.1s both",
        }}>
          404
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize:   20,
          color:      "#0f172a",
          margin:     "0 0 10px",
          animation:  "fadeUp 0.5s 0.18s both",
        }}>
          Spot Not Found
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize:   14,
          color:      "#64748b",
          lineHeight: 1.6,
          maxWidth:   320,
          margin:     "0 0 32px",
          animation:  "fadeUp 0.5s 0.24s both",
        }}>
          Looks like this parking spot doesn't exist. The page you're looking for
          may have been moved or never existed.
        </p>

        {/* Divider */}
        <div style={{
          width: "100%", height: 1,
          background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)",
          marginBottom: 28,
          animation: "fadeUp 0.5s 0.28s both",
        }} />

        {/* CTA button */}
        <button
          onClick={() => navigate("/")}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        8,
            padding:    "11px 28px",
            borderRadius: 99,
            background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
            color:      "#fff",
            border:     "none",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize:   14,
            cursor:     "pointer",
            boxShadow:  "0 4px 18px rgba(37,99,235,0.32)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            animation:  "fadeUp 0.5s 0.32s both",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform  = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow  = "0 8px 24px rgba(37,99,235,0.38)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform  = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow  = "0 4px 18px rgba(37,99,235,0.32)";
          }}
        >
          {/* Home icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Back to Dashboard
        </button>

        {/* Status chip */}
        <div style={{
          marginTop:  18,
          display:    "flex",
          alignItems: "center",
          gap:        6,
          padding:    "4px 12px",
          borderRadius: 99,
          background: "#f1f5f9",
          border:     "1px solid #e2e8f0",
          fontSize:   11,
          fontWeight: 600,
          color:      "#94a3b8",
          animation:  "fadeUp 0.5s 0.38s both",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#cbd5e1", display: "inline-block",
          }} />
          HTTP 404 · Page Not Found
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}