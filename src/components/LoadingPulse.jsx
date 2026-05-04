export default function LoadingPulse({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: "50%", background: "var(--accent)",
            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "var(--font-body)", textAlign: "center" }}>{text}</p>
    </div>
  );
}
