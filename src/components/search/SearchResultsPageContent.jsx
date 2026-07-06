import Pagination from "../common/Pagination";
import EmptySearchState from "./results/EmptySearchState";
import SearchFiltersSidebar from "./results/SearchFiltersSidebar";
import SearchProductCard from "./results/SearchProductCard";
import SearchResultsHeader from "./results/SearchResultsHeader";
import useSearchResultsPage from "./results/useSearchResultsPage";
import { getProductId } from "./results/searchUtils";

export default function SearchResultsPage() {
  const {
    query,
    sort,
    setSort,
    sortOpen,
    setSortOpen,
    selectedCategories,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    page,
    setPage,
    added,
    allResults,
    results,
    totalPages,
    toggleCategory,
    handleAddToCart,
  } = useSearchResultsPage();

  return (
    <main data-testid="search-results-page" className="min-h-screen pt-14" style={{ background: "var(--color-equator-cream)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-6">
          <SearchFiltersSidebar
            selectedCategories={selectedCategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            onToggleCategory={toggleCategory}
          />

          <div className="flex-1 min-w-0">
            <SearchResultsHeader
              query={query}
              total={allResults.length}
              sort={sort}
              setSort={setSort}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
            />

            {results.length === 0 ? (
              <EmptySearchState />
            ) : (
              <div data-testid="search-results-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((product) => {
                  const productId = getProductId(product);

                  return (
                    <SearchProductCard
                      key={productId || product.id}
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
