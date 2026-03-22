import Navbar from "../components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      overflowX: "hidden",
      position: "relative",
      zIndex: 1,
    }}>
      <Navbar />
      <main style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "clamp(14px, 3vw, 28px) clamp(14px, 3vw, 28px) 48px",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {children}
      </main>
    </div>
  );
}