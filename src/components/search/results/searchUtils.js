export const SEARCH_RESULTS_PER_PAGE = 8;

export function getProductId(product) {
  return (
    product?.productId ||
    product?.id ||
    product?.promoId ||
    product?._raw?.productPromoSummaryDto?.productId ||
    product?._raw?.productPromoSummaryDto?.id ||
    null
  );
}

export function getStoreId(product) {
  return product?.storeId || product?.store?.id || product?.storeSlug || product?._raw?.productPromoSummaryDto?.storeId || null;
}

export function getProductAssetId(product) {
  const assetIds = Array.isArray(product?.assetIds) ? product.assetIds : [];
  const promoAssetIds = product?._raw?.productPromoSummaryDto?.assetIds || [];
  const catalogAssetIds = product?._raw?.clientCatalogProductSummaryDto?.assetIds || [];

  return (
    product?.coverAssetId ||
    product?.assetId ||
    product?.imageAssetId ||
    product?.mainAssetId ||
    assetIds[0] ||
    product?._raw?.productPromoSummaryDto?.coverAssetId ||
    promoAssetIds[0] ||
    product?._raw?.clientCatalogProductSummaryDto?.coverAssetId ||
    catalogAssetIds[0] ||
    null
  );
}

export function isRenderableImageUrl(value) {
  if (!value || typeof value !== "string") return false;
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("/");
}

export function getFallbackImage(product) {
  return [product?.image, product?.thumbnail, product?.cover, product?.coverImage].find(isRenderableImageUrl) || null;
}

export function formatPrice(value, currency = "FCFA") {
  const price = Number(value || 0);

  if (currency === "€" || currency === "EUR") {
    return `${price.toFixed(2).replace(".", ",")} €`;
  }

  return `${price.toLocaleString("fr-FR")} ${currency}`;
}
