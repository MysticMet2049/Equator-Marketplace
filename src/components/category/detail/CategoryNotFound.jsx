export default function CategoryNotFound() {
  return (
    <div
      className="min-h-screen pt-14 flex items-center justify-center"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-equator-muted)",
        }}
      >
        Catégorie introuvable.
      </p>
    </div>
  );
}
