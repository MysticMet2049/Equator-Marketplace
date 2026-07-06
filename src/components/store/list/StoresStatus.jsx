export default function StoresStatus({ loading, error, isEmpty }) {
  const message = loading
    ? "Chargement des boutiques..."
    : error
      ? "Impossible de charger les boutiques."
      : isEmpty
        ? "Aucune boutique trouvée."
        : null;

  if (!message) return null;

  return (
    <div className="text-center py-20">
      <p className="text-lg font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-muted)" }}>
        {message}
      </p>
    </div>
  );
}
