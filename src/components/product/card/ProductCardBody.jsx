import StarRating from "../../common/StarRating";
import { formatProductCardPrice } from "./productCardUtils";

/** Text, price and rating area of a product card. */
export default function ProductCardBody({ product, compact, localError }) {
  const paddingClass = compact ? "p-3" : "p-4";

  return (
    <div data-testid="product-card-body" className={paddingClass}>
      <p
        data-testid="product-card-store-name"
        className="text-[11px] mb-1 line-clamp-1"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        {product?.storeName || product?.store || "Store partenaire"}
      </p>

      <h3
        data-testid="product-card-title"
        className={`${compact ? "text-sm" : "text-base"} font-semibold mb-2 leading-snug line-clamp-2 min-h-[2.5rem]`}
        style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
      >
        {product?.name || "Produit"}
      </h3>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p
            data-testid="product-card-price"
            className="text-sm font-bold leading-tight"
            style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
          >
            {formatProductCardPrice(product?.price)}
          </p>

          {product?.oldPrice && (
            <p
              className="text-[11px] line-through mt-0.5"
              style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
            >
              {formatProductCardPrice(product.oldPrice)}
            </p>
          )}
        </div>

        <StarRating rating={Number(product?.rating || 0)} size={compact ? 10 : 11} showValue />
      </div>

      {localError && (
        <p className="text-[11px] mt-2" style={{ color: "#dc2626" }}>
          {localError}
        </p>
      )}
    </div>
  );
}
