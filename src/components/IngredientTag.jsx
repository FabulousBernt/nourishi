export default function IngredientTag({ text, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "var(--tag-bg)", color: "var(--tag-fg)",
      padding: "6px 12px", borderRadius: 20, fontSize: 14, fontFamily: "var(--font-body)",
    }}>
      {text}
      <button onClick={onRemove} style={{
        background: "none", border: "none", color: "var(--tag-fg)",
        cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, opacity: 0.6,
      }}>×</button>
    </span>
  );
}
