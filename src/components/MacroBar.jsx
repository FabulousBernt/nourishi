export default function MacroBar({ calories, protein, carbs, fat, isApprox }) {
  const total = (protein || 0) + (carbs || 0) + (fat || 0);
  const pPct = total > 0 ? ((protein || 0) / total * 100) : 33;
  const cPct = total > 0 ? ((carbs || 0) / total * 100) : 34;
  const fPct = total > 0 ? ((fat || 0) / total * 100) : 33;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-body)", color: "var(--text)" }}>
          {calories || "—"} cal
        </span>
        {isApprox && (
          <span style={{
            fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 700,
            color: "var(--accent)", background: "var(--accent-dim)",
            padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
          }}>≈ Approx</span>
        )}
      </div>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 8, background: "var(--border-light)" }}>
        <div style={{ width: `${pPct}%`, background: "var(--macro-protein)", transition: "width 0.5s" }} />
        <div style={{ width: `${cPct}%`, background: "var(--macro-carbs)", transition: "width 0.5s" }} />
        <div style={{ width: `${fPct}%`, background: "var(--macro-fat)", transition: "width 0.5s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
        <span>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--macro-protein)", marginRight: 4, verticalAlign: "middle" }} />
          Protein {protein || "—"}g
        </span>
        <span>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--macro-carbs)", marginRight: 4, verticalAlign: "middle" }} />
          Carbs {carbs || "—"}g
        </span>
        <span>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--macro-fat)", marginRight: 4, verticalAlign: "middle" }} />
          Fat {fat || "—"}g
        </span>
      </div>
    </div>
  );
}
