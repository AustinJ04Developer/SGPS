import React from "react";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";

interface State { hasError: boolean; error?: any; }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any): State { return { hasError: true, error }; }
  componentDidCatch(error: any, _info: any) {
    if (import.meta.env.DEV) { console.group("ErrorBoundary"); console.error(error); console.groupEnd(); }
  }

  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", padding: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #fca5a5", borderRadius: 18, padding: "36px 28px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 12px 40px rgba(15,23,42,0.1)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fef2f2", border: "1px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={24} style={{ color: "#dc2626" }}/>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 19, color: "#0f172a", marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>An unexpected error occurred. Please try again or refresh.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => this.setState({ hasError: false })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.28)" }}>
              <RotateCcw size={13}/> Try Again
            </button>
            <button onClick={() => window.location.reload()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw size={13}/> Reload
            </button>
          </div>
        </div>
      </div>
    );
    return this.props.children;
  }
}