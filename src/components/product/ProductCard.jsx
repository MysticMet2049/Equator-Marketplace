import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
import ProductFavoriteButton from "../favorites/ProductFavoriteButton";
import ProductCardBody from "./card/ProductCardBody";
import ProductCardImage from "./card/ProductCardImage";
import { getProductId } from "./card/productCardUtils";

/** Compact product tile used across marketplace, store, category and account pages. */
export default function ProductCard({ product, compact = false }) {
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState(null);

  const productId = getProductId(product);
  const imageHeightClass = compact ? "h-32 sm:h-36" : "h-40 sm:h-48";

  const handleNavigate = () => {
    if (!productId) return;
    navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, productId } } });
  };

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    setLocalError(null);

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!productId || !product?.storeId) {
      console.warn("[ProductCard] productId ou storeId manquant :", product);
      setLocalError("Impossible d’ajouter ce produit au panier.");
      return;
    }

    try {
      await addToCart(productId, product.storeId, product, 1);
    } catch (err) {
      console.error("[ProductCard] Erreur ajout panier :", err);
      setLocalError("Impossible d’ajouter ce produit au panier.");
    }
  };

  const handleFavoriteError = (error) => {
    console.error("[ProductCard] Erreur favori :", error);
    setLocalError("Impossible de mettre à jour les favoris pour le moment.");
  };

  return (
    <article
      data-testid="product-card"
      data-product-id={productId || "unknown"}
      data-store-id={product?.storeId || "unknown"}
      className="product-card group relative h-full cursor-pointer rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ border: "1px solid var(--color-equator-beige)", boxShadow: "0 8px 24px rgba(24, 38, 30, 0.06)" }}
      onClick={handleNavigate}
    >
      <div data-testid="product-card-image-wrapper" className={`relative overflow-hidden ${imageHeightClass}`} style={{ background: "#f0ebe3" }}>
        <ProductCardImage product={product} />

        {product?.badge && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: String(product.badge).startsWith("-") ? "#dc2626" : "var(--color-equator-green)",
              fontFamily: "var(--font-body)",
            }}
          >
            {product.badge}
          </span>
        )}

        <ProductFavoriteButton
          product={product}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{ background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
          iconSize={13}
          onError={handleFavoriteError}
        />

        <button
          data-testid="product-card-add-to-cart"
          type="button"
          onClick={handleAddToCart}
          disabled={cartLoading}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 disabled:opacity-60"
          style={{ background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.13)" }}
          aria-label="Ajouter au panier"
        >
          <FiShoppingCart size={14} style={{ color: "var(--color-equator-green)" }} />
        </button>
      </div>

      <ProductCardBody product={product} compact={compact} localError={localError} />
    </article>
  );
}
