import Pagination from "../common/Pagination";
import ProductFiltersSidebar from "../product/filters/ProductFiltersSidebar";
import EmptySearchState from "./results/EmptySearchState";
import SearchProductCard from "./results/SearchProductCard";
import SearchResultsHeader from "./results/SearchResultsHeader";
import useSearchResultsPage from "./results/useSearchResultsPage";
import { getProductId } from "./results/searchUtils";

export default function SearchResultsPage() {
  const {
    query,
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minRating,
    setMinRating,
    onlyDiscounted,
    setOnlyDiscounted,
    maxAvailablePrice,
    hasActiveFilters,
    resetFilters,
    page,
    setPage,
    added,
    allResults,
    results,
    totalPages,
    loading,
    error,
    handleAddToCart,
  } = useSearchResultsPage();

  const headerSortValue = sortBy === "default" ? "pertinence" : sortBy;
  const handleHeaderSortChange = (nextSort) => {
    setSortBy(nextSort === "pertinence" ? "default" : nextSort);
  };

  return (
    <main data-testid="search-results-page" className="min-h-screen pt-14" style={{ background: "var(--color-equator-cream)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          <ProductFiltersSidebar
            testIdPrefix="search"
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            onlyDiscounted={onlyDiscounted}
            setOnlyDiscounted={setOnlyDiscounted}
            sortBy={sortBy}
            setSortBy={setSortBy}
            maxAvailablePrice={maxAvailablePrice}
          />

          <div className="flex-1 min-w-0">
            <SearchResultsHeader
              query={query}
              total={allResults.length}
              sort={headerSortValue}
              setSort={handleHeaderSortChange}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
            />

            {loading ? (
              <div data-testid="search-results-loading" className="text-center py-20">
                <p className="text-lg" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-display)" }}>
                  Chargement des résultats...
                </p>
              </div>
            ) : error ? (
              <div data-testid="search-results-error" className="text-center py-20 bg-white rounded-3xl" style={{ border: "1px solid var(--color-equator-beige)" }}>
                <p className="text-lg" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-display)" }}>
                  Impossible de charger les résultats.
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--color-equator-muted)" }}>
                  Vérifiez que le serveur backend est accessible.
                </p>
              </div>
            ) : results.length === 0 ? (
              <EmptySearchState />
            ) : (
              <div data-testid="search-results-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((product) => {
                  const productId = getProductId(product);

                  return (
                    <SearchProductCard
                      key={productId || product.id || product.summaryId}
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      added={added[productId]}
                    />
                  );
                })}
              </div>
            )}

            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </main>
  );
}
