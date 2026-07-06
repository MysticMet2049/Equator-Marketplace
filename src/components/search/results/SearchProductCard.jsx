import { useNavigate } from "react-router-dom";
import StarRating from "../../common/StarRating";
import SearchProductImage from "./SearchProductImage";
import ProductFavoriteButton from "../../favorites/ProductFavoriteButton";
import { formatPrice, getProductId, getStoreId } from "./searchUtils";

export default function SearchProductCard({ product, onAddToCart, added }) {
  const navigate = useNavigate();
  const productId = getProductId(product);
  const storeId = getStoreId(product);
  const currency = product?.currency || "FCFA";

  const handleNavigate = () => {
    if (!productId) return;
    navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, productId } } });
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer"
      style={{ border: "1px solid var(--color-equator-beige)", transition: "box-shadow 0.2s" }}
      onClick={handleNavigate}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", background: "#f5f0e8" }}>
        <SearchProductImage product={product} />

        <ProductFavoriteButton
          product={product}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          }}
          iconSize={13}
        />

        {product?.badge && (
          <span
            className="absolute top-2.5 left-2.5 text-xs font-medium px-2 py-0.5 rounded"
            style={{
              background: String(product.badge).startsWith("-") ? "#dc2626" : "var(--color-equator-green)",
              color: "white",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "0.05em",
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1">
          <StarRating rating={product?.rating || 0} size={11} />
          <span className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            {product?.rating || 0} ({product?.reviewCount || 0})
          </span>
        </div>

        <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
          {product?.name || "Produit"}
        </p>

        <p className="text-base font-bold mt-auto" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
          {formatPrice(product?.price, currency)}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="w-full py-2 rounded-lg text-xs font-medium text-white transition-all mt-1"
          style={{ background: added ? "#16a34a" : "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
        >
          {added ? "✓ Ajouté" : "Ajouter au panier"}
        </button>

        {storeId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stores/${storeId}`);
            }}
            className="w-full py-1.5 rounded-lg text-xs font-medium text-center transition-all"
            style={{ border: "1px solid var(--color-equator-beige)", color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
          >
            Visiter le shop
          </button>
        )}
      </div>
    </div>
  );
}
