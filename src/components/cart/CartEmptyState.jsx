import { Link } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";

// État affiché lorsque le panier ne contient aucun article.
export default function CartEmptyState({ error, orderError, isAuthenticated }) {
  return (
    <main
      data-testid="cart-empty-state"
      className="min-h-screen pt-14 flex flex-col"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--color-equator-beige)" }}
        >
          <FiShoppingBag size={28} style={{ color: "var(--color-equator-muted)" }} />
        </div>

        <div className="text-center">
          <h2
            className="text-2xl font-light mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-equator-text)",
            }}
          >
            Votre panier est vide
          </h2>
          <p
            className="text-sm"
            style={{
              color: "var(--color-equator-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Découvrez nos produits et ajoutez vos coups de cœur.
          </p>
        </div>

        {(orderError || error) && (
          <p
            className="text-sm text-center max-w-sm"
            style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}
          >
            {orderError || error}
          </p>
        )}

        {!isAuthenticated && (
          <div
            className="text-center p-4 rounded-xl max-w-sm"
            style={{ background: "#e8f5ee", border: "1px solid #a7f3d0" }}
          >
            <p
              className="text-sm mb-3"
              style={{
                color: "var(--color-equator-green)",
                fontFamily: "var(--font-body)",
              }}
            >
              Connectez-vous pour sauvegarder votre panier et retrouver vos articles plus tard.
            </p>
            <Link
              to="/login"
              className="text-sm font-semibold"
              style={{ color: "var(--color-equator-green-dark)" }}
            >
              Se connecter →
            </Link>
          </div>
        )}

        <Link
          to="/marketplace"
          className="px-8 py-3 rounded-xl text-sm font-semibold text-white"
          style={{
            background: "var(--color-equator-green)",
            fontFamily: "var(--font-body)",
          }}
        >
          Explorer la marketplace
        </Link>
      </div>
</main>
  );
}
