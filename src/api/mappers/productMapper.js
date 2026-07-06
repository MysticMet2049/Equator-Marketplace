/**
 * productMapper.js
 * Transforme les DTO produits WYLov en objets lisibles par le frontend.
 *
 * Le backend renvoie plusieurs DTO selon l'endpoint :
 * - ClientProductSummaryDtoPromoHeaderSummaryDto
 * - ClientProductSummaryDtoProductHeaderSummaryDto
 * - ClientCatalogProductQueryResultDto
 * - ClientCatalogProductSummaryDto
 * - ProductHeaderSummaryDto
 *
 * Ce mapper conserve les champs nécessaires pour séparer correctement :
 * - les produits promotionnels ;
 * - les produits phares ;
 * - les produits du catalogue.
 */

import { deriveBadge } from "./shared";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeId(value) {
  const defined = firstDefined(value);
  return defined === undefined ? null : defined;
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeAssetIds(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") return item;
      return item?.id || item?.assetId || item?.asset?.id || null;
    })
    .filter(Boolean);
}

function unwrapProductDto(apiProduct) {
  const wrapped = apiProduct || {};

  const inner =
    wrapped.productPromoSummaryDto ||
    wrapped.productPromoHeaderSummaryDto ||
    wrapped.clientCatalogProductSummaryDto ||
    wrapped.catalogProductSummaryDto ||
    wrapped.productHeaderSummaryDto ||
    wrapped.productSummaryDto ||
    wrapped.product ||
    wrapped.catalogProduct ||
    null;

  const product = inner || wrapped;

  return {
    product,
    raw: wrapped,
    currency: wrapped.currency || product.currency || {},
    userPreference: wrapped.userPreferenceSummaryDto || product.userPreferenceSummaryDto || null,
  };
}

function getStoreId({ product, raw }) {
  return normalizeId(
    product.storeId,
    product.store?.id,
    product.store?.storeId,
    product.storeHeaderInfoSummaryDto?.id,
    product.organisationId,
    product.organisation?.id,
    product.ownerId,
    raw.storeId,
    raw.store?.id,
    raw.store?.storeId,
    raw.storeHeaderInfoSummaryDto?.id,
    raw.organisationId,
    raw.organisation?.id,
    raw.productPromoSummaryDto?.storeId,
    raw.productPromoHeaderSummaryDto?.storeId,
    raw.clientCatalogProductSummaryDto?.storeId,
    raw.catalogProductSummaryDto?.storeId,
    raw.productHeaderSummaryDto?.storeId,
    raw.product?.storeId,
    raw.catalogProduct?.storeId,
    raw.shopId,
    raw.merchantId
  );
}

function getStoreName({ product, raw }) {
  return firstDefined(
    product.storeName,
    product.store?.name,
    product.storeHeaderInfoSummaryDto?.name,
    product.organisationName,
    product.organisation?.name,
    raw.storeName,
    raw.store?.name,
    raw.storeHeaderInfoSummaryDto?.name,
    raw.productPromoSummaryDto?.storeName,
    raw.productPromoSummaryDto?.store?.name,
    raw.productPromoHeaderSummaryDto?.storeName,
    raw.clientCatalogProductSummaryDto?.storeName,
    raw.catalogProductSummaryDto?.storeName,
    raw.productHeaderSummaryDto?.storeName,
    null
  );
}

function getPriceInfo({ product, raw }) {
  const listPrice = toNumber(
    firstDefined(
      product.listPrice,
      product.oldPrice,
      product.basePrice,
      product.minimumSalePrice,
      product.price,
      raw.listPrice,
      raw.oldPrice,
      raw.basePrice,
      raw.minimumSalePrice,
      raw.price,
      raw.productPromoSummaryDto?.listPrice,
      raw.clientCatalogProductSummaryDto?.listPrice,
      raw.catalogProductSummaryDto?.listPrice,
      0
    )
  );

  const salePrice = toNumber(
    firstDefined(
      product.newPrice,
      product.promoPrice,
      product.salePrice,
      product.salesPrice,
      product.minimumSalePrice,
      product.price,
      raw.newPrice,
      raw.promoPrice,
      raw.salePrice,
      raw.salesPrice,
      raw.minimumSalePrice,
      raw.price,
      raw.productPromoSummaryDto?.newPrice,
      raw.productPromoSummaryDto?.promoPrice,
      raw.clientCatalogProductSummaryDto?.promoPrice,
      listPrice
    ),
    listPrice
  );

  const discountPercentage = firstDefined(
    product.discountPercentage,
    product.discountRate,
    raw.discountPercentage,
    raw.productPromoSummaryDto?.discountPercentage,
    null
  );

  return {
    listPrice,
    salePrice,
    hasDiscount: listPrice > 0 && salePrice > 0 && salePrice < listPrice,
    discountPercentage,
  };
}

function getImageInfo({ product, raw }) {
  const coverAssetId = normalizeId(
    product.coverAssetId,
    product.assetId,
    product.imageAssetId,
    product.mainAssetId,
    raw.coverAssetId,
    raw.assetId,
    raw.imageAssetId,
    raw.mainAssetId,
    raw.productPromoSummaryDto?.coverAssetId,
    raw.clientCatalogProductSummaryDto?.coverAssetId,
    raw.clientCatalogProductSummaryDto?.assetId,
    raw.catalogProductSummaryDto?.coverAssetId,
    raw.productHeaderSummaryDto?.coverAssetId,
    null
  );

  const assetIds = normalizeAssetIds(
    firstDefined(
      product.assetIds,
      product.assets,
      product.images,
      raw.assetIds,
      raw.assets,
      raw.images,
      raw.productPromoSummaryDto?.assetIds,
      raw.clientCatalogProductSummaryDto?.assetIds,
      raw.catalogProductSummaryDto?.assetIds,
      []
    )
  );

  const finalAssetIds = coverAssetId
    ? [coverAssetId, ...assetIds.filter((assetId) => String(assetId) !== String(coverAssetId))]
    : assetIds;

  const images = Array.isArray(product.images)
    ? product.images.filter((image) => typeof image === "string")
    : Array.isArray(raw.images)
      ? raw.images.filter((image) => typeof image === "string")
      : [];

  return {
    coverAssetId,
    assetIds: finalAssetIds,
    image: firstDefined(product.image, product.imageUrl, raw.image, raw.imageUrl, null),
    images,
  };
}

function upper(value) {
  return String(value || "").toUpperCase();
}

function isTruthyFlag(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function getNature({ product, raw }) {
  return upper(
    product.nature ||
      product.promoType ||
      product.promotionType ||
      raw.nature ||
      raw.promoType ||
      raw.promotionType ||
      raw.productPromoSummaryDto?.nature ||
      raw.productPromoSummaryDto?.promoType ||
      raw.productPromoHeaderSummaryDto?.nature
  );
}

function getProductType({ product, raw }) {
  return firstDefined(
    product.productType,
    product.type,
    raw.productType,
    raw.type,
    "PRODUCT"
  );
}

export function mapProductFromApi(apiProduct) {
  if (!apiProduct) return null;

  const parts = unwrapProductDto(apiProduct);
  const { product, raw, currency, userPreference } = parts;
  const priceInfo = getPriceInfo(parts);
  const imageInfo = getImageInfo(parts);
  const nature = getNature(parts);

  const productId = normalizeId(
    product.productId,
    raw.productId,
    raw.productPromoSummaryDto?.productId,
    raw.productPromoHeaderSummaryDto?.productId,
    product.id,
    raw.id
  );

  const promoId = normalizeId(
    product.promoId,
    raw.promoId,
    raw.productPromoSummaryDto?.id,
    raw.productPromoHeaderSummaryDto?.id,
    nature ? product.id : null
  );

  const summaryId = normalizeId(raw.id, product.summaryId);
  const storeId = getStoreId(parts);
  const isTopProduct = Boolean(
    isTruthyFlag(product.isTopProduct) ||
      isTruthyFlag(product.topProduct) ||
      isTruthyFlag(raw.isTopProduct) ||
      isTruthyFlag(raw.productPromoSummaryDto?.isTopProduct) ||
      isTruthyFlag(raw.productPromoHeaderSummaryDto?.isTopProduct)
  );

  const isPromoProduct = Boolean(
    nature === "PROMOTIONAL" ||
      priceInfo.hasDiscount ||
      Number(priceInfo.discountPercentage || 0) > 0
  );

  const isHeadlineProduct = Boolean(nature === "FLAGSHIP" || isTopProduct);
  const visibleInCatalog = firstDefined(
    product.visibleInCatalog,
    raw.visibleInCatalog,
    raw.productPromoSummaryDto?.visibleInCatalog,
    raw.clientCatalogProductSummaryDto?.visibleInCatalog,
    true
  );

  return {
    id: productId,
    productId,
    promoId,
    summaryId,

    name: firstDefined(product.name, raw.name, raw.designation, "Produit"),
    description: firstDefined(product.description, raw.description, ""),

    price: priceInfo.salePrice,
    oldPrice: priceInfo.hasDiscount ? priceInfo.listPrice : null,
    originalPrice: priceInfo.hasDiscount ? priceInfo.listPrice : null,
    discountPercentage: priceInfo.discountPercentage,

    ...imageInfo,

    storeId,
    storeName: getStoreName(parts),

    category: firstDefined(
      product.category,
      raw.category,
      (product.categories ?? raw.categories ?? [])[0],
      null
    ),
    categories: product.categories ?? raw.categories ?? [],

    rating: toNumber(firstDefined(product.averageRating, raw.averageRating, product.rating, raw.rating, 0)),
    reviewCount: toNumber(firstDefined(product.ratingCount, raw.ratingCount, product.reviewCount, raw.reviewCount, 0)),

    currency: firstDefined(currency.symbol, currency.code, product.currencyName, raw.currencyName, "FCFA"),

    badge: deriveBadge(product),
    isTopProduct,
    isPromoProduct,
    isHeadlineProduct,
    isCatalogProduct: Boolean(visibleInCatalog),
    visibleInCatalog: Boolean(visibleInCatalog),

    stockStatus: firstDefined(product.stockStatus, raw.stockStatus, null),
    availableQuantity: firstDefined(product.availableQuantity, raw.availableQuantity, product.totalStock, raw.totalStock, null),
    manageStock: Boolean(firstDefined(product.manageStock, raw.manageStock, false)),

    type: getProductType(parts),
    nature,
    postStatus: firstDefined(product.postStatus, raw.postStatus, null),

    isFavorite: Boolean(userPreference?.isFavorite),
    isLike: Boolean(userPreference?.isLike),
    isReviewed: Boolean(userPreference?.isReviewed),

    specs: product.specs ?? raw.specs ?? {},
    reviews: product.reviews ?? raw.reviews ?? [],
    ratingBreakdown: product.ratingBreakdown ?? raw.ratingBreakdown ?? null,

    _raw: apiProduct,
  };
}

export default mapProductFromApi;
