import useCategoryDetailPage from "./useCategoryDetailPage";
import CategoryBreadcrumb from "./detail/CategoryBreadcrumb";
import CategoryFilters from "./detail/CategoryFilters";
import CategoryHero from "./detail/CategoryHero";
import CategoryNotFound from "./detail/CategoryNotFound";
import CategoryResultsPanel from "./detail/CategoryResultsPanel";

export default function CategoryDetail({ slug }) {
  const state = useCategoryDetailPage(slug);

  if (!state.category) {
    return <CategoryNotFound />;
  }

  return (
    <main
      data-testid="category-detail-page"
      className="min-h-screen pt-14"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <CategoryBreadcrumb category={state.category} />
      <CategoryHero category={state.category} />

      <div data-testid="category-detail-content" className="max-w-7xl mx-auto px-6 pb-12 flex gap-6">
        <CategoryFilters
          priceRange={state.priceRange}
          stockOnly={state.stockOnly}
          onPriceRangeChange={state.updatePriceRange}
          onToggleStockOnly={state.toggleStockOnly}
          onClear={state.clearFilters}
        />

        <CategoryResultsPanel
          loading={state.loading}
          error={state.error}
          filteredProducts={state.filteredProducts}
          visibleProducts={state.visibleProducts}
          added={state.added}
          sort={state.sort}
          sortOpen={state.sortOpen}
          page={state.page}
          totalPages={state.totalPages}
          onAdd={state.handleAdd}
          onPageChange={state.setPage}
          onToggleSort={() => state.setSortOpen((prev) => !prev)}
          onChangeSort={state.changeSort}
        />
      </div>
</main>
  );
}
