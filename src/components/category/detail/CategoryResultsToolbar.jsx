import CategorySortDropdown from "./CategorySortDropdown";

export default function CategoryResultsToolbar({
  loading,
  count,
  sort,
  sortOpen,
  onToggleSort,
  onChangeSort,
}) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <p
        className="text-sm"
        style={{
          color: "var(--color-equator-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        {loading
          ? "Chargement..."
          : `${count} produit${count > 1 ? "s" : ""} trouvé${
              count > 1 ? "s" : ""
            }`}
      </p>

      <CategorySortDropdown
        sort={sort}
        sortOpen={sortOpen}
        onToggle={onToggleSort}
        onChange={onChangeSort}
      />
    </div>
  );
}
