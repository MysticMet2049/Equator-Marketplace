/** Utilities for product cards. They normalize the many DTO shapes returned
 * by Wylov APIs so the visual component can stay small and readable.
 */

export function getProductId(product) {
  return (
    product?.productId ||
    product?.refId ||
    product?.userPreferenceSummaryDto?.refId ||
    product?.id ||
    product?.promoId ||
    product?.summaryId ||
    product?._raw?.productId ||
    product?._raw?.refId ||
    product?._raw?.userPreferenceSummaryDto?.refId ||
    product?._raw?.id ||
    product?._raw?.promoId ||
    product?._raw?.summaryId ||
    product?._raw?.productPromoSummaryDto?.productId ||
    product?._raw?.productPromoSummaryDto?.id ||
    product?._raw?.productPromoHeaderSummaryDto?.productId ||
    product?._raw?.productPromoHeaderSummaryDto?.id ||
    product?._raw?.clientCatalogProductSummaryDto?.productId ||
    product?._raw?.clientCatalogProductSummaryDto?.id ||
    product?._raw?.catalogProductSummaryDto?.productId ||
    product?._raw?.catalogProductSummaryDto?.id ||
    product?._raw?.productHeaderSummaryDto?.productId ||
    product?._raw?.productHeaderSummaryDto?.id ||
    null
  );
}

export function getProductImageUrl(product) {
  const image =
    product?.image ||
    product?.imageUrl ||
    product?.thumbnail ||
    product?.cover ||
    product?.coverImage ||
    product?._raw?.image ||
    product?._raw?.imageUrl ||
    product?._raw?.thumbnail ||
    product?._raw?.cover ||
    product?._raw?.coverImage ||
    null;

  if (!image) return null;
  if (typeof image === "object") return image.src || image.url || image.imageUrl || image.thumbnail || null;
  if (typeof image !== "string") return null;

  return image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:") ||
    image.startsWith("/")
    ? image
    : null;
}

function getAssetIdFromSummary(summary) {
  if (!summary) return null;
  const assetIds = Array.isArray(summary.assetIds) ? summary.assetIds : [];

  return (
    summary.coverAssetId ||
    summary.mainImageAssetId ||
    summary.imageAssetId ||
    summary.mainAssetId ||
    summary.assetId ||
    summary.image?.assetId ||
    summary.image?.id ||
    assetIds[0] ||
    null
  );
}

export function getProductAssetId(product) {
  const assetIds = Array.isArray(product?.assetIds) ? product.assetIds : [];
  const rawAssetIds = Array.isArray(product?._raw?.assetIds) ? product._raw.assetIds : [];
  const summaries = [
    product?.productPromoSummaryDto,
    product?.productPromoHeaderSummaryDto,
    product?.clientCatalogProductSummaryDto,
    product?.catalogProductSummaryDto,
    product?.productHeaderSummaryDto,
    product?.userPreferenceSummaryDto?.productPromoSummaryDto,
    product?.userPreferenceSummaryDto?.productHeaderSummaryDto,
    product?.userPreferenceSummaryDto?.refSummary,
    product?._raw?.productPromoSummaryDto,
    product?._raw?.productPromoHeaderSummaryDto,
    product?._raw?.clientCatalogProductSummaryDto,
    product?._raw?.catalogProductSummaryDto,
    product?._raw?.productHeaderSummaryDto,
    product?._raw?.userPreferenceSummaryDto?.productPromoSummaryDto,
    product?._raw?.userPreferenceSummaryDto?.productHeaderSummaryDto,
    product?._raw?.userPreferenceSummaryDto?.refSummary,
  ];

  return (
    product?.coverAssetId ||
    product?.mainImageAssetId ||
    product?.imageAssetId ||
    product?.mainAssetId ||
    product?.assetId ||
    product?.image?.assetId ||
    product?.image?.id ||
    assetIds[0] ||
    product?._raw?.coverAssetId ||
    product?._raw?.mainImageAssetId ||
    product?._raw?.imageAssetId ||
    product?._raw?.mainAssetId ||
    product?._raw?.assetId ||
    product?._raw?.image?.assetId ||
    product?._raw?.image?.id ||
    rawAssetIds[0] ||
    summaries.map(getAssetIdFromSummary).find(Boolean) ||
    null
  );
}

export function formatProductCardPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}
