// Détermine si une chaîne peut être directement utilisée comme image HTML.
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

export function getStoreId(store) {
  return (
    store?.id ||
    store?.storeId ||
    store?._raw?.id ||
    store?._raw?.storeId ||
    store?._raw?.storeHeaderInfoSummaryDto?.id ||
    null
  );
}

export function getStoreAssetId(store) {
  const header = store?._raw?.storeHeaderInfoSummaryDto || {};

  return (
    store?.assetId ||
    store?.coverAssetId ||
    store?.bannerAssetId ||
    store?.imageAssetId ||
    store?.logoId ||
    extractAssetId(store?.image) ||
    extractAssetId(store?.logo) ||
    extractAssetId(store?.cover) ||
    extractAssetId(store?.coverImage) ||
    extractAssetId(store?.banner) ||
    extractAssetId(header.assetId) ||
    extractAssetId(header.logoId) ||
    null
  );
}

export function getStoreFallbackImage(store) {
  return (
    [store?.image, store?.logo, store?.cover, store?.coverImage, store?.banner]
      .filter(isRenderableImageUrl)[0] || null
  );
}

export function getStoreDescription(store) {
  return (
    store?.tagline ||
    store?.description ||
    store?._raw?.storeHeaderInfoSummaryDto?.description ||
    "Boutique partenaire sur Equator Marketplace."
  );
}

export function buildStoreHeroSlides(stores = []) {
  return stores.filter(Boolean).map((store) => {
    const storeId = getStoreId(store);

    return {
      type: "store",
      id: storeId || store.name,
      storeId,
      assetId: getStoreAssetId(store),
      image: getStoreFallbackImage(store),
      tag: "Store partenaire",
      title: store.name || store.storeName || "Boutique Equator",
      subtitle: getStoreDescription(store),
      ctaSecondary: "Voir les stores",
      primaryLink: storeId ? `/stores/${storeId}` : "/stores",
      secondaryLink: "/stores",
      rating: Number(store.rating || store.averageRating || 0),
      productCount: store.productCount,
      state: storeId ? { store: { ...store, id: storeId } } : undefined,
    };
  });
}

export function buildHeroSlides(products = []) {
  return products.slice(0, 4).map((product) => ({
    type: "product",
    id: product.id || product.productId,
    productId: product.productId || product.id,
    coverAssetId: product.coverAssetId,
    tag: product.badge || "Produit en vedette",
    title: product.name,
    subtitle: product.description || "Découvrez ce produit disponible sur Equator.",
    image: product.image,
    cta: "Acheter maintenant",
    ctaSecondary: "Voir le produit",
    primaryLink: `/product/${product.productId || product.id}`,
    secondaryLink: `/product/${product.productId || product.id}`,
  }));
}
