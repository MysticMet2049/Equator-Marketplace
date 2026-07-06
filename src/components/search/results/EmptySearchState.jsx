import { FiSearch } from "react-icons/fi";

export default function EmptySearchState() {
  return (
    <div className="text-center py-24">
      <FiSearch size={36} className="mx-auto mb-4" style={{ color: "var(--color-equator-beige)" }} />
      <p className="text-xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-muted)" }}>
        Aucun résultat trouvé
      </p>
      <p className="text-sm mt-2" style={{ color: "var(--color-equator-muted)" }}>
        Essayez un autre terme ou élargissez vos filtres.
      </p>
    </div>
  );
}
