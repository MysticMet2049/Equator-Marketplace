// Fonctions utilitaires utilisées par la page de liste des boutiques.

export function isRenderableImageUrl(value) {
  if (!value || typeof value !== "string") return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
}

export function extractAssetId(value) {
  if (!value) return null;
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed && !isRenderableImageUrl(trimmed) ? trimmed : null;
  }

  if (typeof value === "object") {
    return (
      value.assetId ||
      value.id ||
      value.coverAssetId ||
      value.bannerAssetId ||
      value.logoId ||
      value.imageAssetId ||
      null
    );
  }

  return null;
}

export function getStoreImage(store) {
  return (
    [store?.image, store?.logo, store?.cover, store?.coverImage, store?.banner].find(
      isRenderableImageUrl
    ) || null
  );
}

export function getStoreAssetId(store) {
  return (
    store?.assetId ||
    store?.coverAssetId ||
    store?.bannerAssetId ||
    store?.logoId ||
    extractAssetId(store?.image) ||
    extractAssetId(store?.logo) ||
    extractAssetId(store?.cover) ||
    extractAssetId(store?.coverImage) ||
    extractAssetId(store?.banner) ||
    extractAssetId(store?._raw?.storeHeaderInfoSummaryDto?.assetId) ||
    extractAssetId(store?._raw?.storeHeaderInfoSummaryDto?.logoId) ||
    null
  );
}

export function getStoreId(store) {
  return (
    store?.id ||
    store?.storeId ||
    store?._raw?.id ||
    store?._raw?.storeHeaderInfoSummaryDto?.id ||
    null
  );
}

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function getApiProductCount(store) {
  const raw = store?._raw || {};
  const header = raw.storeHeaderInfoSummaryDto || raw.storeHeaderInfo || raw.store || {};

  return toCount(
    store?.productCount ??
      store?.productsCount ??
      store?.totalProducts ??
      store?.totalProduct ??
      store?.numberOfProducts ??
      store?.catalogProductCount ??
      store?.productPromoCount ??
      header.productCount ??
      header.productsCount ??
      header.totalProducts ??
      header.totalProduct ??
      header.numberOfProducts ??
      header.catalogProductCount ??
      header.productPromoCount ??
      raw.productCount ??
      raw.productsCount ??
      raw.totalProducts ??
      raw.totalProduct ??
      raw.numberOfProducts ??
      raw.catalogProductCount ??
      raw.productPromoCount
  );
}

// Enrichit une boutique avec le compteur produit calculé sans bloquer l'affichage des stores.
export function enrichStore(store, productMetrics = new Map(), options = {}) {
  const storeId = getStoreId(store);
  const metricsCount = toCount(productMetrics.get(String(storeId)));
  const apiProductCount = getApiProductCount(store);

  const apiRating = Number(store?.rating || store?.averageRating || 0);
  const apiReviewCount = Number(store?.reviewCount || store?.ratingCount || 0);

  const productCount = metricsCount ?? apiProductCount ?? null;

  return {
    ...store,
    id: storeId,
    computedProductCount: productCount,
    productCount,
    productCountLoading: !options.metricsReady && productCount === null,
    computedRating: Number(apiRating || 0),
    computedReviewCount: Number(apiReviewCount || 0),
  };
}
