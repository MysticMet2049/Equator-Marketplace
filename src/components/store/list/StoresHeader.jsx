import { STORES_PER_PAGE } from "./storeListConfig";

export default function StoresHeader({ loading, page, storesCount, filteredCount }) {
  const first = storesCount ? (page - 1) * STORES_PER_PAGE + 1 : 0;
  const last = Math.min(page * STORES_PER_PAGE, filteredCount);

  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-3xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          Stores
        </h1>

        <p className="text-sm mt-1" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
          Découvrez les boutiques disponibles sur Equator.
        </p>
      </div>

      <p className="text-xs self-end" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
        {loading ? "Chargement..." : `Affichage de ${first}-${last} sur ${filteredCount} boutiques`}
      </p>
    </div>
  );
}
