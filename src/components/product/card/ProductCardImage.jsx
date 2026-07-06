import ApiImage from "../../common/ApiImage";
import {
  getProductAssetId,
  getProductId,
  getProductImageUrl,
} from "./productCardUtils";
import { getProductRefEntityIdCandidates } from "./productCardRefUtils";

/** Handles product card images from either direct URLs or backend asset IDs. */
export default function ProductCardImage({ product }) {
  const productId = getProductId(product);
  const fallbackImage = getProductImageUrl(product);
  const assetId = getProductAssetId(product);
  const refEntityIdCandidates = getProductRefEntityIdCandidates(product, productId);

  if (assetId && productId) {
    return (
      <ApiImage
        data-testid="product-card-image"
        assetId={assetId}
        refType="PRODUCT"
        refEntityId={productId}
        refEntityIdCandidates={refEntityIdCandidates}
        type="PRODUCT_IMAGE"
        typeCandidates={["PRODUCT_IMAGE", "OTHER"]}
        alt={product.name || "Produit"}
        fileSizeType="MEDIUM"
        fileSizeTypeCandidates={["SMALL", "DETAIL", "LARGE", "THUMBNAIL"]}
        lazy
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  if (fallbackImage) {
    return (
      <img
        data-testid="product-card-image"
        src={fallbackImage}
        alt={product?.name || "Produit"}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div data-testid="product-card-image-placeholder" className="w-full h-full flex items-center justify-center px-3 text-center">
      <span
        className="text-xs"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        Image indisponible
      </span>
    </div>
  );
}
