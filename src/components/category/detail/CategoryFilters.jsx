export default function CategoryFilters({
  priceRange,
  stockOnly,
  onPriceRangeChange,
  onToggleStockOnly,
  onClear,
}) {
  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <div
        className="bg-white rounded-xl p-5 space-y-6 sticky top-20"
        style={{ border: "1px solid var(--color-equator-beige)" }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-xs font-bold tracking-widest"
            style={{
              color: "var(--color-equator-text)",
              fontFamily: "var(--font-body)",
            }}
          >
            Filtres
          </p>

          <button
            onClick={onClear}
            className="text-xs"
            style={{
              color: "var(--color-equator-green)",
              fontFamily: "var(--font-body)",
            }}
          >
            ✕
          </button>
        </div>

        <div>
          <p
            className="text-xs font-semibold mb-3"
            style={{
              color: "var(--color-equator-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Gamme de prix
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange("min", e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded outline-none"
              style={{
                border: "1px solid var(--color-equator-beige)",
                fontFamily: "var(--font-body)",
              }}
            />

            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => onPriceRangeChange("max", e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded outline-none"
              style={{
                border: "1px solid var(--color-equator-beige)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
        </div>

        <div>
          <p
            className="text-xs font-semibold mb-3"
            style={{
              color: "var(--color-equator-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Disponibilité
          </p>

          <button className="flex items-center gap-2" onClick={onToggleStockOnly}>
            <div
              className="w-3.5 h-3.5 rounded-sm border transition-all shrink-0"
              style={{
                border: `1.5px solid ${
                  stockOnly ? "var(--color-equator-green)" : "#ccc"
                }`,
                background: stockOnly ? "var(--color-equator-green)" : "white",
              }}
            />

            <span
              className="text-xs"
              style={{
                color: "var(--color-equator-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              En stock uniquement
            </span>
          </button>
        </div>

        <button
          onClick={onClear}
          className="w-full text-xs py-2 rounded-lg transition-colors hover:bg-stone-100"
          style={{
            border: "1px solid var(--color-equator-beige)",
            color: "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          EFFACER LES FILTRES
        </button>
      </div>
    </aside>
  );
}
