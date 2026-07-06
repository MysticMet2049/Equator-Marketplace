export default function SectionError({ message }) {
  if (!message) return null;

  return (
    <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", fontFamily: "var(--font-body)" }}>
      {message}
    </div>
  );
}
