import { Link } from "react-router-dom";

// Bannière d'information lorsque l'utilisateur consulte le panier sans être connecté.
export default function CartAuthBanner({ isAuthenticated }) {
  if (isAuthenticated) return null;

  return (
    <div data-testid="cart-auth-banner"
      className="mb-6 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3"
      style={{ background: "#e8f5ee", border: "1px solid #a7f3d0" }}
    >
      <p
        className="text-sm"
        style={{
          color: "var(--color-equator-green)",
          fontFamily: "var(--font-body)",
        }}
      >
        Connectez-vous pour sauvegarder votre panier et retrouver vos articles plus tard.
      </p>
      <Link
        to="/login"
        className="text-xs font-semibold px-4 py-1.5 rounded-full"
        style={{
          background: "var(--color-equator-green)",
          color: "white",
          fontFamily: "var(--font-body)",
        }}
      >
        Se connecter
      </Link>
    </div>
  );
}
