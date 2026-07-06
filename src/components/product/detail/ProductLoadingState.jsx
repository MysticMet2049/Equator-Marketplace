export default function ProductLoadingState() {
  return (
    <div
      data-testid="product-loading-state" className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "var(--color-equator-cream)" }}>
      <p style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-muted)" }}>
        Chargement du produit...
      </p>
    </div>
  );
}
