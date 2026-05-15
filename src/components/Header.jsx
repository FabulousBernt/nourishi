export default function Header() {
  return (
    <header style={{
      padding: "44px 24px 24px",
      textAlign: "center",
      position: "relative",
    }}>
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: 38, margin: "0 0 14px", color: "var(--text)",
        fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.5,
      }}>
        The Plateful
      </h1>
      <div style={{
        width: 40, height: 3, background: "var(--gold)", borderRadius: 2,
        margin: "0 auto 12px",
      }} />
      <span style={{ fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--accent)", letterSpacing: 0.5 }}>
        AI-Powered Recipe Discovery
      </span>
    </header>
  );
}
