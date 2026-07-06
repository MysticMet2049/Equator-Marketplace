
// État affiché pendant la récupération initiale du panier.
export default function CartLoadingState() {
  return (
    <div
      data-testid="cart-loading-state"
      className="min-h-screen pt-14 flex flex-col"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <div className="flex-1 flex items-center justify-center px-6">
        <p
          className="text-sm"
          style={{
            color: "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Chargement du panier...
        </p>
      </div>
</div>
  );
}
