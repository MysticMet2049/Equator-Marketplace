export default function StoreDetailStatus({ type }) {
  const messages = {
    loading: "Chargement de la boutique...",
    error: "Impossible de charger la boutique.",
    notFound: "Boutique introuvable.",
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "var(--color-equator-cream)" }}>
      <p style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-muted)" }}>
        {messages[type] || messages.notFound}
      </p>
    </div>
  );
}
