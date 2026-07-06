import Pagination from "../common/Pagination";
import StoreCard from "./list/StoreCard";
import StoresHeader from "./list/StoresHeader";
import StoresStatus from "./list/StoresStatus";
import useStoresPage from "./list/useStoresPage";

// Contenu principal de la page Stores.
// La sidebar a été retirée : plus de catégories, filtres ou bloc vendeur.
export default function StoresPageContent() {
  const {
    page,
    setPage,
    stores,
    filteredStores,
    totalPages,
    loading,
    error,
    isEmpty,
  } = useStoresPage();

  const hasContent = !loading && !error && !isEmpty && stores.length > 0;

  return (
    <main
      data-testid="stores-page"
      className="min-h-screen pt-14"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <div data-testid="stores-page-content" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <StoresHeader
          loading={loading}
          page={page}
          storesCount={stores.length}
          filteredCount={filteredStores.length}
        />

        <StoresStatus
          loading={loading}
          error={error}
          isEmpty={isEmpty || stores.length === 0}
        />

        {hasContent && (
          <>
            <div data-testid="stores-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            {totalPages > 1 && (
              <div data-testid="stores-pagination" className="mt-8">
                <Pagination
                  current={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
</main>
  );
}