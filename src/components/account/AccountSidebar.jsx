import { FiHeart, FiLogOut, FiPackage, FiRefreshCw, FiUser } from "react-icons/fi";

const NAV_ITEMS = [
  { id: "profile", label: "Mon profil", icon: FiUser },
  { id: "favorites", label: "Mes favoris", icon: FiHeart },
  { id: "stores", label: "Mes comptes enseignes", icon: FiPackage },
];

export default function AccountSidebar({ profile, accountInitial, activeSection, setActiveSection, loading, onRefresh, onLogout }) {
  return (
    <aside data-testid="account-sidebar" className="lg:w-72 shrink-0">
      <div className="bg-white rounded-2xl p-5 sticky top-20" style={{ border: "1px solid var(--color-equator-beige)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-display)" }}>
            {accountInitial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>{profile.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{profile.email || profile.username}</p>
          </div>
        </div>

        <nav data-testid="account-sidebar-nav" className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`account-sidebar-${id}`}
              onClick={() => setActiveSection(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: activeSection === id ? "#e8f5ee" : "transparent",
                color: activeSection === id ? "var(--color-equator-green)" : "var(--color-equator-text)",
                fontFamily: "var(--font-body)",
                fontWeight: activeSection === id ? 600 : 400,
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-5 space-y-2" style={{ borderTop: "1px solid var(--color-equator-beige)" }}>
          <button data-testid="account-refresh-button" onClick={onRefresh} disabled={loading} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
          <button data-testid="account-logout-button" onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm" style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}>
            <FiLogOut size={16} /> Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
