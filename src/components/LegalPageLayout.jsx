import Link from "next/link";

export default function LegalPageLayout({ title, children }) {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)",
      maxWidth: 600, margin: "0 auto", padding: "0 0 60px",
    }}>
      <div style={{ padding: "16px 20px" }}>
        <Link href="/" style={{
          color: "var(--text-muted)", textDecoration: "none", fontSize: 14,
          fontWeight: 600, fontFamily: "var(--font-body)",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          ← Back to The Plateful
        </Link>
      </div>

      <div style={{ padding: "8px 24px 40px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800,
          color: "var(--text)", margin: "0 0 24px",
        }}>
          {title}
        </h1>

        <style>{`
          .legal-page h3 {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            margin: 24px 0 10px;
            color: var(--accent);
          }
          .legal-page h3:first-child { margin-top: 0; }
          .legal-page p { margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: var(--text); }
          .legal-page ul { margin: 0 0 14px; padding-left: 20px; }
          .legal-page li { margin-bottom: 8px; font-size: 15px; line-height: 1.7; }
          .legal-page em { color: var(--text-muted); }
        `}</style>
        <div className="legal-page">
          {children}
        </div>
      </div>
    </div>
  );
}
