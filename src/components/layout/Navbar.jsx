import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut} from "react-icons/fi";
import { useApi } from "../../context/ApiContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";

export default function Navbar() {
  // Récupère les informations globales liées au panier et à la recherche.
 const { searchQuery, setSearchQuery } = useApi();
const { cartCount } = useCart();
  // Récupère l'état de connexion, les informations de l'utilisateur et la fonction de déconnexion.

  const { isAuthenticated, user, logout } = useAuth();
  // Récupère l'état de connexion, les informations de l'utilisateur et la fonction de déconnexion.
  const [scrolled, setScrolled] = useState(false);
  // Contrôle l'ouverture et la fermeture du menu mobile.
  const [mobileOpen, setMobileOpen] = useState(false);
  // Stocke temporairement la recherche saisie par l'utilisateur avant validation.
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  // Contrôle l'affichage du menu déroulant de l'utilisateur connecté.
  const [userMenu, setUserMenu] = useState(false);
  // Permet de rediriger l'utilisateur vers une autre page après une action.
  const navigate = useNavigate();

  // Surveille le scroll de la page pour appliquer un style différent à la navbar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // Gère la soumission du formulaire de recherche et redirige vers la page des résultats.
  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
      setMobileOpen(false);
    }
  };
  // Liste des liens principaux affichés dans la navigation.
  const navLinks = [
    { to: "/marketplace", label: "Marketplace" },
    { to: "/stores",      label: "Stores" },
    { to: "/categories",  label: "Categories" },
  ];

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/97 backdrop-blur-md shadow-sm" : "bg-white"}`}
      style={{ borderBottom: "1px solid #e9e4dc" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center gap-4 md:gap-6">
        {/* Logo de la plateforme */}
        <Link to="/" data-testid="navbar-logo" className="text-xl font-semibold tracking-tight shrink-0"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          Equator
        </Link>

        {/* Navigation principale sur ordinateur */}
        <nav data-testid="navbar-desktop-nav" className="hidden md:flex items-center gap-5">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to}
              data-testid={`navbar-link-${label.toLowerCase()}`}
              className={({ isActive }) => `nav-link text-sm font-medium pb-0.5 transition-colors ${isActive ? "active" : ""}`}
              style={({ isActive }) => ({ color: isActive ? "var(--color-equator-green)" : "var(--color-equator-muted)" })}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Barre de recherche sur ordinateur */}
        <form data-testid="navbar-search-form" onSubmit={handleSearch} className="hidden md:flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: "var(--color-equator-beige)", border: "1px solid #d9d3c8", minWidth: "220px" }}>
          <FiSearch size={13} style={{ color: "var(--color-equator-muted)", flexShrink: 0 }} />
          <input data-testid="navbar-search-input" type="text" placeholder="Rechercher sur Equator..."
            value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }} />
        </form>

        {/* Icône du panier avec le nombre d'articles */}
        <Link to="/cart" data-testid="navbar-cart-link" className="relative p-2 rounded-full transition-colors hover:bg-stone-100">
          <FiShoppingCart size={18} style={{ color: "var(--color-equator-text)" }} />
          {/* Affiche le badge du panier uniquement s'il contient au moins un article. */}
          {cartCount > 0 && (
            <span data-testid="navbar-cart-badge" className="absolute -top-0.5 -right-0.5 text-white w-4 h-4 rounded-full flex items-center justify-center font-medium"
              style={{ background: "var(--color-equator-green)", fontSize: "9px" }}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {/* Menu utilisateur sur ordinateur */}
        <div className="hidden md:block relative">
          {/* Affiche le menu utilisateur si l'utilisateur est connecté, sinon l'icône de connexion. */}
          {isAuthenticated ? (
            <>
              <button
                data-testid="navbar-user-menu-button"
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 p-1.5 rounded-full transition-colors hover:bg-stone-100"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
                  {user?.name?.charAt(0) || "U"}
                </div>
              </button>
              {/* Menu déroulant contenant les raccourcis du compte utilisateur. */}
              {userMenu && (
                <div data-testid="navbar-user-menu" className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden w-48 z-50"
                  style={{ background: "white", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid var(--color-equator-beige)" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-equator-beige)" }}>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>{user?.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{user?.email}</p>
                  </div>
                  {[
                    { to: "/account", icon: FiUser, label: "Mon profil" },
                    { to: "/cart", icon: FiShoppingCart, label: "Mon panier" },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} data-testid={`navbar-user-menu-link-${label.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-stone-50"
                      style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
                      <Icon size={13} /> {label}
                    </Link>
                  ))}
                  {/* Déconnecte l'utilisateur, ferme le menu et le redirige vers l'accueil. */}
                  <button data-testid="navbar-logout-button" onClick={() => { logout(); setUserMenu(false); navigate("/"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                    style={{ color: "#dc2626", fontFamily: "var(--font-body)", borderTop: "1px solid var(--color-equator-beige)" }}>
                    <FiLogOut size={13} /> Déconnexion
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" data-testid="navbar-login-link" className="p-2 rounded-full transition-colors hover:bg-stone-100">
              <FiUser size={18} style={{ color: "var(--color-equator-text)" }} />
            </Link>
          )}
        </div>

        {/* Bouton d'ouverture et de fermeture du menu mobile */}
        <button data-testid="navbar-mobile-toggle" className="md:hidden p-2 rounded-full transition-colors hover:bg-stone-100" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={18} style={{ color: "var(--color-equator-text)" }} /> : <FiMenu size={18} style={{ color: "var(--color-equator-text)" }} />}
        </button>
      </div>

      {/* Menu de navigation mobile */}
      {/* Affiche le menu mobile uniquement lorsqu'il est ouvert. */}
      {mobileOpen && (
        <div data-testid="navbar-mobile-menu" className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--color-equator-beige)", background: "white" }}>
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} data-testid={`navbar-mobile-link-${label.toLowerCase()}`} className="text-sm font-medium py-1"
              style={{ color: "var(--color-equator-muted)" }} onClick={() => setMobileOpen(false)}>
              {label}
            </NavLink>
          ))}
          <form data-testid="navbar-mobile-search-form" onSubmit={handleSearch} className="flex items-center gap-2 rounded-full px-3 py-1.5 mt-1"
            style={{ background: "var(--color-equator-beige)", border: "1px solid #d9d3c8" }}>
            <FiSearch size={13} style={{ color: "var(--color-equator-muted)" }} />
            <input data-testid="navbar-mobile-search-input" type="text" placeholder="Rechercher..." value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1"
              style={{ fontFamily: "var(--font-body)" }} />
          </form>
           {/* Sur mobile, affiche le bouton de déconnexion si l'utilisateur est connecté. */}
          <div className="pt-1">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/account"
                  data-testid="navbar-mobile-account-link"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-stone-100"
                  style={{
                    color: "var(--color-equator-text)",
                    border: "1px solid var(--color-equator-beige)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <FiUser size={15} />
                  Mon profil
                </Link>

                <Link
                  to="/cart"
                  data-testid="navbar-mobile-cart-link"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-stone-100"
                  style={{
                    color: "var(--color-equator-text)",
                    border: "1px solid var(--color-equator-beige)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <FiShoppingCart size={15} />
                  Mon panier
                </Link>

                <button
                  data-testid="navbar-mobile-logout-button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate("/");
                  }}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-red-50"
                  style={{
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <FiLogOut size={15} />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  data-testid="navbar-mobile-login-link"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-xs py-2 rounded-lg font-medium text-white"
                  style={{ background: "var(--color-equator-green)" }}
                >
                  Se connecter
                </Link>

                <Link
                  to="/register"
                  data-testid="navbar-mobile-register-link"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-xs py-2 rounded-lg font-medium"
                  style={{
                    border: "1px solid var(--color-equator-beige)",
                    color: "var(--color-equator-text)",
                  }}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
