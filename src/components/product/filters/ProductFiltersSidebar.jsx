import { FiSliders, FiStar, FiX } from "react-icons/fi";

export const PRICE_PRESETS = [
  { label: "Jusqu’à 5 000 FCFA", min: "", max: "5000" },
  { label: "de 5 000 à 15 000 FCFA", min: "5000", max: "15000" },
  { label: "de 15 000 à 50 000 FCFA", min: "15000", max: "50000" },
  { label: "de 50 000 à 100 000 FCFA", min: "50000", max: "100000" },
  { label: "100 000 FCFA et plus", min: "100000", max: "" },
];

export const RATING_PRESETS = [
  { label: "4 étoiles et plus", value: 4 },
  { label: "3 étoiles et plus", value: 3 },
  { label: "2 étoiles et plus", value: 2 },
  { label: "1 étoile et plus", value: 1 },
];

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ")} FCFA`;
}

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isSamePricePreset(preset, minPrice, maxPrice) {
  return String(minPrice || "") === String(preset.min || "") && String(maxPrice || "") === String(preset.max || "");
}

export default function ProductFiltersSidebar({
  testIdPrefix = "product",
  hasActiveFilters = false,
  onResetFilters,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  onlyDiscounted,
  setOnlyDiscounted,
  sortBy,
  setSortBy,
  maxAvailablePrice = 100000,
}) {
  const safeMaxAvailablePrice = Math.max(1000, Number(maxAvailablePrice) || 100000);
  const sliderMinPrice = String(minPrice || "").trim() ? normalizeNumber(minPrice, 0) : 0;
  const sliderMaxPrice = String(maxPrice || "").trim()
    ? normalizeNumber(maxPrice, safeMaxAvailablePrice)
    : safeMaxAvailablePrice;
  const safeSliderMinPrice = Math.min(Math.max(sliderMinPrice, 0), safeMaxAvailablePrice);
  const safeSliderMaxPrice = Math.min(Math.max(sliderMaxPrice, safeSliderMinPrice), safeMaxAvailablePrice);

  const checkboxStyle = {
    accentColor: "var(--color-equator-green)",
  };

  const sectionTitleStyle = {
    color: "var(--color-equator-text)",
    fontFamily: "var(--font-body)",
  };

  const applyPricePreset = (preset) => {
    if (isSamePricePreset(preset, minPrice, maxPrice)) {
      setMinPrice("");
      setMaxPrice("");
      return;
    }

    setMinPrice(preset.min);
    setMaxPrice(preset.max);
  };

  const handleMinSliderChange = (event) => {
    const value = Math.min(Number(event.target.value), safeSliderMaxPrice);
    setMinPrice(value > 0 ? String(value) : "");
  };

  const handleMaxSliderChange = (event) => {
    const value = Math.max(Number(event.target.value), safeSliderMinPrice);
    setMaxPrice(value < safeMaxAvailablePrice ? String(value) : "");
  };

  return (
    <aside
      data-testid={`${testIdPrefix}-side-filters`}
      className="bg-white p-5 lg:sticky lg:top-20"
      style={{ border: "1px solid var(--color-equator-beige)", boxShadow: "0 10px 24px rgba(24, 38, 30, 0.05)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <FiSliders size={16} style={{ color: "var(--color-equator-green)" }} />
          <p className="text-base font-bold" style={sectionTitleStyle}>
            Filtres
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
          >
            <FiX size={12} /> Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-7">
        <section>
          <h2 className="text-base font-bold mb-3" style={sectionTitleStyle}>
            Prix
          </h2>

          <p className="text-sm font-bold mb-3" style={sectionTitleStyle}>
            {formatPrice(safeSliderMinPrice)} – {String(maxPrice || "").trim() ? formatPrice(safeSliderMaxPrice) : `${formatPrice(safeMaxAvailablePrice)} et plus`}
          </p>

          <div className="mb-5">
            <input
              data-testid={`${testIdPrefix}-min-price-slider`}
              type="range"
              min="0"
              max={safeMaxAvailablePrice}
              step="500"
              value={safeSliderMinPrice}
              onChange={handleMinSliderChange}
              className="w-full"
              style={{ accentColor: "var(--color-equator-green)" }}
            />
            <input
              data-testid={`${testIdPrefix}-max-price-slider`}
              type="range"
              min="0"
              max={safeMaxAvailablePrice}
              step="500"
              value={safeSliderMaxPrice}
              onChange={handleMaxSliderChange}
              className="w-full -mt-2"
              style={{ accentColor: "var(--color-equator-green)" }}
            />
          </div>

          <div className="space-y-2.5">
            {PRICE_PRESETS.map((preset) => (
              <label key={preset.label} className="flex items-center gap-3 text-sm cursor-pointer" style={sectionTitleStyle}>
                <input
                  type="checkbox"
                  checked={isSamePricePreset(preset, minPrice, maxPrice)}
                  onChange={() => applyPricePreset(preset)}
                  className="w-4 h-4"
                  style={checkboxStyle}
                />
                <span>{preset.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={sectionTitleStyle}>
            Avis clients
          </h2>

          <div className="space-y-2.5">
            {RATING_PRESETS.map((rating) => (
              <label key={rating.value} className="flex items-center gap-3 text-sm cursor-pointer" style={sectionTitleStyle}>
                <input
                  data-testid={`${testIdPrefix}-rating-filter`}
                  type="checkbox"
                  checked={minRating === rating.value}
                  onChange={() => setMinRating(minRating === rating.value ? 0 : rating.value)}
                  className="w-4 h-4"
                  style={checkboxStyle}
                />
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar
                      key={index}
                      size={14}
                      fill={index < rating.value ? "currentColor" : "none"}
                      style={{ color: "var(--color-equator-green)" }}
                    />
                  ))}
                  <span className="ml-1">{rating.label}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={sectionTitleStyle}>
            Promotions et bonnes affaires
          </h2>

          <label className="flex items-center gap-3 text-sm cursor-pointer" style={sectionTitleStyle}>
            <input
              data-testid={`${testIdPrefix}-discount-filter`}
              type="checkbox"
              checked={onlyDiscounted}
              onChange={(event) => setOnlyDiscounted(event.target.checked)}
              className="w-4 h-4"
              style={checkboxStyle}
            />
            <span>Produits en promotion</span>
          </label>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={sectionTitleStyle}>
            Trier par
          </h2>

          <select
            data-testid={`${testIdPrefix}-sort`}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
            style={{ border: "1px solid var(--color-equator-beige)", fontFamily: "var(--font-body)" }}
          >
            <option value="default">Pertinence</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="discount">Meilleures réductions</option>
            <option value="rating">Mieux notés</option>
          </select>
        </section>
      </div>
    </aside>
  );
}
