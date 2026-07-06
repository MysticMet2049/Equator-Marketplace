import CategoryStatusMessage from "./CategoryStatusMessage";
import useCategoryListing from "./useCategoryListing";
import CategoryGrid from "./listing/CategoryGrid";
import CategoryListingHeader from "./listing/CategoryListingHeader";

export default function CategoryListing() {
  const { categories, loading, error } = useCategoryListing();

  return (
    <main
      data-testid="categories-page"
      className="min-h-screen pt-14"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <div data-testid="categories-page-content" className="max-w-7xl mx-auto px-6 py-12">
        <CategoryListingHeader />

        {loading ? (
          <CategoryStatusMessage message="Chargement des catégories..." />
        ) : error ? (
          <CategoryStatusMessage message="Impossible de charger les catégories." />
        ) : categories.length === 0 ? (
          <CategoryStatusMessage message="Aucune catégorie disponible." />
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </div>
</main>
  );
}
