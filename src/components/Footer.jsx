"use client";

export default function Footer({ onLegalPage }) {
  return (
    <footer style={{
      padding: "32px 16px 24px",
      textAlign: "center",
      fontSize: 12,
      fontFamily: "var(--font-body)",
      color: "var(--text-muted)",
    }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10 }}>
        {[
          { id: "about", label: "About" },
          { id: "privacy", label: "Privacy Policy" },
          { id: "terms", label: "Terms of Service" },
        ].map(link => (
          <button
            key={link.id}
            onClick={() => onLegalPage(link.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600,
              color: "var(--text-muted)", padding: "4px 0",
              borderBottom: "1px solid transparent", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderBottomColor = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderBottomColor = "transparent"; }}
          >
            {link.label}
          </button>
        ))}
      </div>
      <span style={{ letterSpacing: 0.3 }}>The Plateful</span>
    </footer>
  );
}
