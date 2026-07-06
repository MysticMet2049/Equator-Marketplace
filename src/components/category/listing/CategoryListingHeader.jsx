export default function CategoryListingHeader() {
  return (
    <>
      <h1
        className="text-3xl font-light mb-2"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-equator-text)",
        }}
      >
        Catégories
      </h1>

      <p
        className="text-sm mb-10"
        style={{ color: "var(--color-equator-muted)" }}
      >
        Explorez les produits disponibles sur Equator par univers.
      </p>
    </>
  );
}
