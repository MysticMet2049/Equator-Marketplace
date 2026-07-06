import { Link } from "react-router-dom";
import {
  FiHeart,
  FiMinus,
  FiPlus,
  FiShare2,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import { PiStorefront } from "react-icons/pi";
import { formatPrice } from "./productDetailUtils";

export default function ProductInfoPanel({
  product,
  qty,
  setQty,
  added,
  cartMessage,
  wishlisted,
  favoritePending,
  cartLoading,
  onAdd,
  onToggleWishlist,
  favoriteError,
}) {
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const originalPrice = Number(product.originalPrice || 0);
  const price = Number(product.price || 0);
  const hasDiscount = originalPrice > price && price > 0;
  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const cartMessageColor =
    cartMessage?.toLowerCase().includes("déjà") ||
    cartMessage?.toLowerCase().includes("deja")
      ? "#92400e"
      : "var(--color-equator-green)";

  return (
    <aside data-testid="product-info-panel" className="w-full lg:sticky lg:top-24">
      <div
        className="rounded-[1.5rem] bg-white p-5 flex flex-col gap-3"
        style={{
          border: "1px solid var(--color-equator-beige)",
          boxShadow: "0 14px 34px rgba(24, 38, 30, 0.08)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.22em] mb-2"
              style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
            >
              {product.store || "Store partenaire"}
            </p>

            <h1
              data-testid="product-title"
              className="text-2xl sm:text-[2rem] font-light leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}
            >
              {product.name}
            </h1>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              data-testid="product-wishlist-button"
              type="button"
              onClick={onToggleWishlist}
              disabled={favoritePending}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                border: "1px solid var(--color-equator-beige)",
                background: wishlisted ? "#fee2e2" : "#fbf8f1",
              }}
              aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
              title={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <FiHeart
                size={17}
                style={{
                  color: wishlisted ? "#dc2626" : "var(--color-equator-muted)",
                  fill: wishlisted ? "#dc2626" : "none",
                }}
              />
            </button>

            <button
              data-testid="product-share-button"
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
              style={{
                border: "1px solid var(--color-equator-beige)",
                background: "#fbf8f1",
              }}
              aria-label="Partager ce produit"
              title="Partager ce produit"
            >
              <FiShare2 size={17} style={{ color: "var(--color-equator-muted)" }} />
            </button>
          </div>
        </div>

        {favoriteError && (
          <p className="text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}>
            Impossible de mettre à jour les favoris pour le moment.
          </p>
        )}

        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
        >
          {product.description || "Produit sélectionné par Equator auprès d’un store partenaire."}
        </p>

        <div
          data-testid="product-price-card"
          className="rounded-2xl p-4"
          style={{ background: "#fbf8f1", border: "1px solid var(--color-equator-beige)" }}
        >
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.18em] mb-1"
                style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
              >
                Prix
              </p>

              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  data-testid="product-price"
                  className="text-3xl sm:text-4xl font-bold"
                  style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
                >
                  {formatPrice(product.price, product.currency)}
                </span>

                {hasDiscount && (
                  <span
                    className="text-sm line-through"
                    style={{ color: "#9ca3af", fontFamily: "var(--font-body)" }}
                  >
                    {formatPrice(product.originalPrice, product.currency)}
                  </span>
                )}
              </div>
            </div>

            {hasDiscount && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
              >
                -{discount}%
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <p
              className="text-xs font-semibold tracking-widest"
              style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
            >
              QUANTITÉ
            </p>

            <div className="flex items-center gap-2 rounded-full bg-white p-1" style={{ border: "1px solid var(--color-equator-beige)" }}>
              <button
                data-testid="product-qty-decrease"
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={cartLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100 disabled:opacity-60"
                aria-label="Réduire la quantité"
              >
                <FiMinus size={13} />
              </button>

              <span data-testid="product-qty-value" className="w-8 text-center text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                {qty}
              </span>

              <button
                data-testid="product-qty-increase"
                type="button"
                onClick={() => setQty(qty + 1)}
                disabled={cartLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100 disabled:opacity-60"
                aria-label="Augmenter la quantité"
              >
                <FiPlus size={13} />
              </button>
            </div>
          </div>

          <button
            data-testid="product-add-to-cart"
            type="button"
            onClick={onAdd}
            disabled={cartLoading}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all mb-3 hover:-translate-y-0.5 disabled:opacity-70"
            style={{
              background: added ? "#16a34a" : "var(--color-equator-green)",
              fontFamily: "var(--font-body)",
              boxShadow: "0 10px 22px rgba(32, 112, 74, 0.22)",
            }}
          >
            <FiTruck size={16} />
            {cartLoading ? "Ajout en cours..." : added ? "✓ Ajouté au panier" : "Ajouter au panier"}
          </button>

          {cartMessage && (
            <p data-testid="product-cart-message" className="mb-3 text-xs font-medium" style={{ color: cartMessageColor, fontFamily: "var(--font-body)" }}>
              {cartMessage}
            </p>
          )}

          {product.storeId && (
            <Link
              data-testid="product-visit-store"
              to={`/stores/${product.storeId}`}
              className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:bg-white"
              style={{
                border: "1px solid var(--color-equator-beige)",
                color: "var(--color-equator-text)",
                fontFamily: "var(--font-body)",
              }}
            >
              <PiStorefront size={16} />
              Visiter le store
            </Link>
          )}
        </div>

        <div className="grid gap-2">
          {[
            { icon: FiShield, text: product.warranty },
            { icon: FiTruck, text: product.delivery },
          ]
            .filter((item) => item.text)
            .map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#fbf8f1" }}>
                <Icon size={14} style={{ color: "var(--color-equator-green)" }} />
                <span className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
                  {text}
                </span>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
}
