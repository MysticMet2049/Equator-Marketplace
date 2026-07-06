// Page Marketplace : affiche les produits, filtres et contrôles de navigation.
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiSliders, FiStar, FiX } from "react-icons/fi";
import ProductCard from "../components/product/ProductCard";
import Pagination from "../components/common/Pagination";
import { useApi } from "../context/ApiContext";
import { useProducts } from "../hooks/useProducts";
import {
  applyMarketplaceFilters,
  getProductPrice,
  paginateMarketplaceProducts,
} from "../utils/marketplaceFilters";

const MARKETPLACE_PAGE_SIZE = 30;
const FILTER_POOL_SIZE = 1000;

const PRICE_PRESETS = [
  { label: "Jusqu’à 5 000 FCFA", min: "", max: "5000" },
  { label: "de 5 000 à 15 000 FCFA", min: "5000", max: "15000" },
  { label: "de 15 000 à 50 000 FCFA", min: "15000", max: "50000" },
  { label: "de 50 000 à 100 000 FCFA", min: "50000", max: "100000" },
  { label: "100 000 FCFA et plus", min: "100000", max: "" },
];

const RATING_PRESETS = [
  { label: "4 étoiles et plus", value: 4 },
  { label: "3 étoiles et plus", value: 3 },
  { label: "2 étoiles et plus", value: 2 },
  { label: "1 étoile et plus", value: 1 },
];

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isSamePricePreset(preset, minPrice, maxPrice) {
  return String(minPrice || "") === String(preset.min || "") && String(maxPrice || "") === String(preset.max || "");
}

export default function MarketplacePage() {
  // On garde seulement les catégories depuis ApiContext pour l’instant,
  // car il n’y a pas encore d’endpoint catégorie clair côté backend.
  const { categories } = useApi();

  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [localPage, setLocalPage] = useState(0);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setLocalSearch(q);
    setDebouncedSearch(q);
  }, [searchParams]);

  // Petit debounce pour éviter d’appeler l’API à chaque frappe instantanément.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch]);

  const hasClientSideFilters = Boolean(
    selectedCategory !== "all" ||
      minPrice.trim() ||
      maxPrice.trim() ||
      minRating > 0 ||
      onlyDiscounted ||
      sortBy !== "default"
  );

  const productParams = useMemo(() => {
    return {
      // Quand un filtre local est actif, on récupère un pool plus large puis on filtre côté client.
      // Le readAll aide surtout les catégories comme “Électronique”, “Mode” et “Maison & Jardin”
      // lorsque le backend ne renseigne pas toujours la catégorie dans les DTO.
      pageSize: hasClientSideFilters ? FILTER_POOL_SIZE : MARKETPLACE_PAGE_SIZE,
      readAll: hasClientSideFilters,
      searchString: debouncedSearch,
    };
  }, [debouncedSearch, hasClientSideFilters]);

  const {
    products,
    totalItems,
    totalPages,
    page,
    setPage,
    loading,
    error,
  } = useProducts(productParams);

  const maxAvailablePrice = useMemo(() => {
    const max = products.reduce((highest, product) => Math.max(highest, getProductPrice(product)), 0);
    return Math.max(1000, Math.ceil(max / 1000) * 1000);
  }, [products]);

  const sliderMinPrice = minPrice.trim() ? normalizeNumber(minPrice, 0) : 0;
  const sliderMaxPrice = maxPrice.trim() ? normalizeNumber(maxPrice, maxAvailablePrice) : maxAvailablePrice;
  const safeSliderMinPrice = Math.min(Math.max(sliderMinPrice, 0), maxAvailablePrice);
  const safeSliderMaxPrice = Math.min(Math.max(sliderMaxPrice, safeSliderMinPrice), maxAvailablePrice);

  // Quand la recherche ou un filtre change, on revient à la première page.
  useEffect(() => {
    setPage(0);
    setLocalPage(0);
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice, minRating, onlyDiscounted, sortBy, setPage]);

  const filteredProducts = useMemo(
    () =>
      applyMarketplaceFilters(products, {
        category: selectedCategory,
        minPrice,
        maxPrice,
        minRating,
        onlyDiscounted,
        sortBy,
      }),
    [products, selectedCategory, minPrice, maxPrice, minRating, onlyDiscounted, sortBy]
  );

  const displayedProducts = hasClientSideFilters
    ? paginateMarketplaceProducts(filteredProducts, localPage, MARKETPLACE_PAGE_SIZE)
    : products;

  const displayedTotalItems = hasClientSideFilters
    ? filteredProducts.length
    : totalItems || products.length;

  const displayedTotalPages = hasClientSideFilters
    ? Math.max(1, Math.ceil(filteredProducts.length / MARKETPLACE_PAGE_SIZE))
    : totalPages;

  const displayedPage = hasClientSideFilters ? localPage : page;
  const isEmpty = !loading && !error && displayedProducts.length === 0;

  const resetFilters = () => {
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setOnlyDiscounted(false);
    setSortBy("default");
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
    setMaxPrice(value < maxAvailablePrice ? String(value) : "");
  };

  const filterButtonStyle = (active) => ({
    background: active ? "var(--color-equator-green)" : "white",
    color: active ? "white" : "var(--color-equator-muted)",
    border: `1px solid ${active ? "var(--color-equator-green)" : "var(--color-equator-beige)"}`,
    fontFamily: "var(--font-body)",
  });

  const checkboxStyle = {
    accentColor: "var(--color-equator-green)",
  };

  const sectionTitleStyle = {
    color: "var(--color-equator-text)",
    fontFamily: "var(--font-body)",
  };

  return (
    <main data-testid="marketplace-page" className="min-h-screen pt-14" style={{ background: "var(--color-equator-cream)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div data-testid="marketplace-header" className="mb-8">
          <h1
            className="text-3xl font-light mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}
          >
            Marketplace
          </h1>

          <p className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
            {loading
              ? "Chargement des produits..."
              : `${displayedTotalItems} produit${displayedTotalItems > 1 ? "s" : ""} trouvé${displayedTotalItems > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search */}
        <div data-testid="marketplace-search" className="flex flex-col sm:flex-row gap-3 mb-8">
          <div
            className="flex items-center gap-2 flex-1 rounded-lg px-3 py-2.5"
            style={{ background: "white", border: "1px solid var(--color-equator-beige)" }}
          >
            <FiSearch size={14} style={{ color: "var(--color-equator-muted)" }} />
            <input
              data-testid="marketplace-search-input"
              type="text"
              placeholder="Rechercher un produit ou une boutique..."
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              className="bg-transparent outline-none text-sm flex-1"
              style={{ fontFamily: "var(--font-body)" }}
            />
          </div>
        </div>

        {/* Category filters */}
        <div data-testid="marketplace-category-filters" className="flex flex-wrap gap-2 mb-8">
          <button
            data-testid="marketplace-category-all"
            onClick={() => setSelectedCategory("all")}
            className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
            style={filterButtonStyle(selectedCategory === "all")}
          >
            Tout
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              data-testid="marketplace-category-filter"
              data-category-name={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
              style={filterButtonStyle(selectedCategory === cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          <aside
            data-testid="marketplace-side-filters"
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

              {hasClientSideFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
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
                  {formatPrice(safeSliderMinPrice)} – {maxPrice.trim() ? formatPrice(safeSliderMaxPrice) : `${formatPrice(maxAvailablePrice)} et plus`}
                </p>

                <div className="mb-5">
                  <input
                    data-testid="marketplace-min-price-slider"
                    type="range"
                    min="0"
                    max={maxAvailablePrice}
                    step="500"
                    value={safeSliderMinPrice}
                    onChange={handleMinSliderChange}
                    className="w-full"
                    style={{ accentColor: "var(--color-equator-green)" }}
                  />
                  <input
                    data-testid="marketplace-max-price-slider"
                    type="range"
                    min="0"
                    max={maxAvailablePrice}
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
                        data-testid="marketplace-rating-filter"
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
                    data-testid="marketplace-discount-filter"
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
                  data-testid="marketplace-sort"
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

          <section className="min-w-0">
            {/* Loading */}
            {loading ? (
              <div data-testid="marketplace-loading" className="text-center py-20">
                <p
                  className="text-lg"
                  style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-display)" }}
                >
                  Chargement des produits...
                </p>
              </div>
            ) : error ? (
              <div data-testid="marketplace-error" className="text-center py-20">
                <p
                  className="text-lg"
                  style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-display)" }}
                >
                  Impossible de charger les produits.
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--color-equator-muted)" }}>
                  Vérifiez que le serveur backend est lancé.
                </p>
              </div>
            ) : isEmpty ? (
              <div data-testid="marketplace-empty" className="text-center py-20 bg-white rounded-3xl" style={{ border: "1px solid var(--color-equator-beige)" }}>
                <p
                  className="text-lg"
                  style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-display)" }}
                >
                  Aucun produit trouvé.
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--color-equator-muted)" }}>
                  Essayez un autre terme de recherche ou réinitialisez les filtres.
                </p>
              </div>
            ) : (
              <>
                <div data-testid="marketplace-products-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id || product.productId || product.summaryId} product={product} compact />
                  ))}
                </div>

                <div data-testid="marketplace-pagination">
                  <Pagination
                    current={displayedPage + 1}
                    total={displayedTotalPages}
                    onChange={(nextPage) => {
                      if (hasClientSideFilters) setLocalPage(nextPage - 1);
                      else setPage(nextPage - 1);
                    }}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
