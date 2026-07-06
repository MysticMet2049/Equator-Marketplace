import ApiImage from "../../common/ApiImage";
import { getProductImage } from "../categoryUtils";

export default function CategoryProductImage({ product }) {
  const image = getProductImage(product);

  if (product.coverAssetId) {
    return (
      <ApiImage
        assetId={product.coverAssetId}
        refType="PRODUCT"
        refEntityId={product.productId || product.id}
        type="PRODUCT_IMAGE"
        typeCandidates={["PRODUCT_IMAGE", "OTHER"]}
        fileSizeType="MEDIUM"
        fileSizeTypeCandidates={["SMALL", "DETAIL", "THUMBNAIL"]}
        alt={product.name || "Produit"}
        fileSizeType="SMALL"
        lazy
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    );
  }

  if (image) {
    return (
      <img
        src={image}
        alt={product.name || "Produit"}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-xs" style={{ color: "var(--color-equator-muted)" }}>
        Image indisponible
      </span>
    </div>
  );
}
