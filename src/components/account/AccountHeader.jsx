export default function AccountHeader({ activeSection, loading, saved }) {
  const titles = {
    profile: "Mon profil",
    favorites: "Mes favoris",
    stores: "Mes comptes enseignes",
    notifs: "Activité du compte",
    orders: "Historique d'achats",
  };

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div>
        <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
          ESPACE CLIENT
        </p>
        <h1 className="text-3xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          {titles[activeSection] || "Mon compte"}
        </h1>
      </div>

      <div className="text-xs" style={{ color: saved ? "var(--color-equator-green)" : "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
        {saved ? "Profil mis à jour" : loading ? "Chargement..." : "Données synchronisées"}
      </div>
    </div>
  );
}
