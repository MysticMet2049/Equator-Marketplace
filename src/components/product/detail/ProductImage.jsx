import ApiImage from "../../common/ApiImage";
import { getProductId } from "./productDetailUtils";

function getProductRefEntityIdCandidates(product, productId) {
  return [
    productId,
    product?.id,
    product?.productId,
    product?.refId,
    product?.summaryId,
    product?.promoId,
    product?.userPreferenceSummaryDto?.refId,

    product?._raw?.id,
    product?._raw?.productId,
    product?._raw?.refId,
    product?._raw?.summaryId,
    product?._raw?.promoId,
    product?._raw?.userPreferenceSummaryDto?.refId,

    product?.productPromoSummaryDto?.id,
    product?.productPromoSummaryDto?.productId,
    product?.productPromoHeaderSummaryDto?.id,
    product?.productPromoHeaderSummaryDto?.productId,
    product?.clientCatalogProductSummaryDto?.id,
    product?.clientCatalogProductSummaryDto?.productId,
    product?.catalogProductSummaryDto?.id,
    product?.catalogProductSummaryDto?.productId,
    product?.productHeaderSummaryDto?.id,
    product?.productHeaderSummaryDto?.productId,

    product?._raw?.productPromoSummaryDto?.id,
    product?._raw?.productPromoSummaryDto?.productId,
    product?._raw?.productPromoHeaderSummaryDto?.id,
    product?._raw?.productPromoHeaderSummaryDto?.productId,
    product?._raw?.clientCatalogProductSummaryDto?.id,
    product?._raw?.clientCatalogProductSummaryDto?.productId,
    product?._raw?.catalogProductSummaryDto?.id,
    product?._raw?.catalogProductSummaryDto?.productId,
    product?._raw?.productHeaderSummaryDto?.id,
    product?._raw?.productHeaderSummaryDto?.productId,
  ].filter(Boolean);
}

export default function ProductImage({ image, product, className = "w-full h-full object-cover" }) {
  const productId = getProductId(product);
  const refEntityIdCandidates = getProductRefEntityIdCandidates(product, productId);

  if (image?.kind === "asset" && image.assetId && productId) {
    return (
      <ApiImage
        assetId={image.assetId}
        refType="PRODUCT"
        refEntityId={productId}
        refEntityIdCandidates={refEntityIdCandidates}
        type="PRODUCT_IMAGE"
        typeCandidates={["PRODUCT_IMAGE", "OTHER"]}
        fileSizeType="MEDIUM"
        fileSizeTypeCandidates={["SMALL", "DETAIL", "LARGE", "THUMBNAIL"]}
        alt={product?.name || "Produit"}
        className={className}
      />
    );
  }

  if (image?.kind === "url" && image.src) {
    return <img src={image.src} alt={product?.name || "Produit"} className={className} />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-sm" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
        Image indisponible
      </span>
    </div>
  );
}
