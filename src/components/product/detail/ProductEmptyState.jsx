export default function ProductEmptyState({ title, message, actionLabel = "Retour à la marketplace", onAction }) {
  return (
    <div
      data-testid="product-empty-state" className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "var(--color-equator-cream)" }}>
      <div className="text-center">
        <h1 className="text-2xl font-light mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          {title}
        </h1>

        {message && (
          <p className="text-sm mb-6" style={{ fontFamily: "var(--font-body)", color: "var(--color-equator-muted)" }}>
            {message}
          </p>
        )}

        {onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
