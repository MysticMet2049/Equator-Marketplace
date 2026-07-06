import Pagination from "../../common/Pagination";
import CategoryProductsGrid from "./CategoryProductsGrid";
import CategoryResultsToolbar from "./CategoryResultsToolbar";

export default function CategoryResultsPanel({
  loading,
  error,
  filteredProducts,
  visibleProducts,
  added,
  sort,
  sortOpen,
  page,
  totalPages,
  onAdd,
  onPageChange,
  onToggleSort,
  onChangeSort,
}) {
  return (
    <div className="flex-1 min-w-0">
      <CategoryResultsToolbar
        loading={loading}
        count={filteredProducts.length}
        sort={sort}
        sortOpen={sortOpen}
        onToggleSort={onToggleSort}
        onChangeSort={onChangeSort}
      />

      <CategoryProductsGrid
        loading={loading}
        error={error}
        products={visibleProducts}
        added={added}
        onAdd={onAdd}
      />

      {totalPages > 1 && (
        <Pagination current={page} total={totalPages} onChange={onPageChange} />
      )}
    </div>
  );
}
