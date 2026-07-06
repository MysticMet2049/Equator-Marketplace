import ApiImage from "../../common/ApiImage";
import { getFallbackImage, getProductAssetId, getProductId } from "./searchUtils";

export default function SearchProductImage({ product }) {
  const productId = getProductId(product);
  const assetId = getProductAssetId(product);
  const fallbackImage = getFallbackImage(product);

  if (assetId && productId) {
    return (
      <ApiImage
        assetId={assetId}
        refType="PRODUCT"
        refEntityId={productId}
        type="PRODUCT_IMAGE"
        typeCandidates={["PRODUCT_IMAGE", "OTHER"]}
        alt={product?.name || "Produit"}
        fileSizeType="MEDIUM"
        fileSizeTypeCandidates={["SMALL", "DETAIL", "THUMBNAIL"]}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    );
  }

  if (fallbackImage) {
    return (
      <img
        src={fallbackImage}
        alt={product?.name || "Produit"}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
        Image indisponible
      </span>
    </div>
  );
}
