/**
 * productApi.js
 * Services produits/catalogue pour Equator.
 *
 * Objectifs de cette version :
 * - ne jamais utiliser /api/client/catalog/products/search-by-criteria/{storeId} ;
 * - éviter les gros chargements bloquants ;
 * - séparer clairement PROMOTIONAL, FLAGSHIP et CATALOG ;
 * - mettre en cache les appels coûteux pendant une courte durée.
 */

import http, { buildSearchQuery, normalizePaginatedResponse } from "./httpClient";
import { mapProductFromApi } from "./mappers/mappers";
import { cachedAsync } from "../utils/cache/persistentCache";

const DEFAULT_PAGE_SIZE = 24;
const STORE_SECTION_PAGE_SIZE = 48;
const GLOBAL_POOL_PAGE_SIZE = 220;
const CACHE_TTL = 5 * 60_000;

/**
 * Cache read-only product calls in memory and localStorage.
 * This avoids reloading Marketplace, Home and Product pages every time the
 * user navigates back and forth. Mutating operations must never use this.
 */
async function cachedRequest(label, payload, loader) {
  return cachedAsync(`product:${label}`, payload, loader, { ttlMs: CACHE_TTL });
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.summaryDtos)) return value.summaryDtos;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.content?.summaryDtos)) return value.content.summaryDtos;
  if (Array.isArray(value?.content?.items)) return value.content.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.summaryDtos)) return value.data.summaryDtos;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  if (value?.content && typeof value.content === "object") return asArray(value.content);
  if (value?.data && typeof value.data === "object") return asArray(value.data);
  return [];
}

function mapItems(items = []) {
  return items.map(mapProductFromApi).filter(Boolean);
}

function normalizeResponse(response, pageSize = DEFAULT_PAGE_SIZE) {
  const normalized = normalizePaginatedResponse(response);
  const rawItems = normalized.items?.length ? normalized.items : asArray(response);
  const items = mapItems(rawItems);
  const safePageSize = Number(pageSize || DEFAULT_PAGE_SIZE);

  return {
    ...normalized,
    items,
    totalItems: Number(normalized.totalItems || items.length || 0),
    totalPages:
      normalized.totalPages || Math.max(1, Math.ceil(items.length / safePageSize)),
    page: normalized.page || 0,
  };
}

function normalizeId(value) {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function upper(value) {
  return String(value || "").toUpperCase();
}

function getRawProduct(product) {
  return product?._raw || product || {};
}

export function getProductStoreId(product) {
  const raw = getRawProduct(product);
  const promo =
    raw.productPromoSummaryDto ||
    raw.productPromoHeaderSummaryDto ||
    raw.productPromo ||
    {};
  const catalog =
    raw.clientCatalogProductSummaryDto ||
    raw.catalogProductSummaryDto ||
    raw.productHeaderSummaryDto ||
    raw.productSummaryDto ||
    raw.product ||
    raw.catalogProduct ||
    {};

  return (
    product?.storeId ??
    product?.store?.id ??
    product?.store?.storeId ??
    product?.storeHeaderInfoSummaryDto?.id ??
    product?.organisationId ??
    product?.organisation?.id ??
    promo.storeId ??
    promo.store?.id ??
    promo.storeHeaderInfoSummaryDto?.id ??
    promo.organisationId ??
    catalog.storeId ??
    catalog.store?.id ??
    catalog.storeHeaderInfoSummaryDto?.id ??
    catalog.organisationId ??
    raw.storeId ??
    raw.store?.id ??
    raw.storeHeaderInfoSummaryDto?.id ??
    raw.organisationId ??
    raw.organisation?.id ??
    null
  );
}

function getProductStoreName(product) {
  const raw = getRawProduct(product);
  const promo = raw.productPromoSummaryDto || raw.productPromoHeaderSummaryDto || {};
  const catalog =
    raw.clientCatalogProductSummaryDto ||
    raw.catalogProductSummaryDto ||
    raw.productHeaderSummaryDto ||
    raw.productSummaryDto ||
    {};

  return (
    product?.storeName ||
    product?.store?.name ||
    product?.storeHeaderInfoSummaryDto?.name ||
    promo.storeName ||
    promo.store?.name ||
    promo.storeHeaderInfoSummaryDto?.name ||
    catalog.storeName ||
    catalog.store?.name ||
    catalog.storeHeaderInfoSummaryDto?.name ||
    raw.storeName ||
    raw.store?.name ||
    raw.storeHeaderInfoSummaryDto?.name ||
    ""
  );
}

function sameStore(product, storeId, storeName = "") {
  const productStoreId = normalizeId(getProductStoreId(product));
  const safeStoreId = normalizeId(storeId);

  if (safeStoreId && productStoreId && productStoreId === safeStoreId) {
    return true;
  }

  const expectedName = normalizeText(storeName);
  const productName = normalizeText(getProductStoreName(product));

  return Boolean(expectedName && productName && productName === expectedName);
}

function filterProductsByStore(products = [], storeId, storeName = "") {
  return products.filter((product) => sameStore(product, storeId, storeName));
}

function getProductKey(product) {
  return normalizeId(
    product?.productId ??
      product?.id ??
      product?.promoId ??
      product?.summaryId ??
      product?._raw?.productPromoSummaryDto?.productId ??
      product?._raw?.productHeaderSummaryDto?.id ??
      product?._raw?.id
  );
}

function uniqueProducts(products = []) {
  const seen = new Set();

  return products.filter((product) => {
    const key = getProductKey(product);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function withoutProducts(products = [], excluded = []) {
  const excludedKeys = new Set(excluded.map(getProductKey).filter(Boolean));
  return products.filter((product) => !excludedKeys.has(getProductKey(product)));
}

function paginate(items = [], params = {}) {
  const page = Number(params.page || 0);
  const pageSize = Number(params.pageSize || DEFAULT_PAGE_SIZE);
  const start = page * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    page,
  };
}

function hasSpecificRequest(params = {}) {
  return Boolean(
    params.searchString ||
      (params.fieldFilters && Object.keys(params.fieldFilters).length > 0) ||
      params.definedFilters?.length
  );
}

function productMatchesText(product, query) {
  const search = normalizeText(query);
  if (!search) return true;

  const text = normalizeText(
    [
      product.name,
      product.description,
      product.storeName,
      product.category,
      ...(Array.isArray(product.categories) ? product.categories : []),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return text.includes(search);
}

function productMatchesFieldFilters(product, fieldFilters = {}) {
  if (!fieldFilters || Object.keys(fieldFilters).length === 0) return true;

  return Object.entries(fieldFilters).every(([key, value]) => {
    const values = Array.isArray(value)
      ? value.map(normalizeText)
      : [normalizeText(value)];
    const field = key.toUpperCase();

    if (field.includes("STORE")) {
      return (
        values.includes(normalizeText(getProductStoreId(product))) ||
        values.includes(normalizeText(getProductStoreName(product)))
      );
    }

    if (field.includes("CATEGORY")) {
      const categories = [product.category, ...(product.categories || [])].map(normalizeText);
      return values.some((item) => categories.includes(item));
    }

    if (field.includes("PROMO") || field.includes("NATURE")) {
      return values.includes(normalizeText(product.nature));
    }

    return true;
  });
}

function applyLocalFilters(products = [], params = {}) {
  return products.filter(
    (product) =>
      productMatchesText(product, params.searchString) &&
      productMatchesFieldFilters(product, params.fieldFilters)
  );
}

function withSection(products = [], sectionType) {
  return products.map((product) => ({ ...product, sectionType }));
}

function hasDiscount(product) {
  const discount = Number(product?.discountPercentage || 0);
  const oldPrice = Number(product?.oldPrice || product?.originalPrice || 0);
  const price = Number(product?.price || 0);

  return discount > 0 || (oldPrice > 0 && price > 0 && price < oldPrice);
}

function getProductNature(product) {
  const raw = getRawProduct(product);
  const promo = raw.productPromoSummaryDto || raw.productPromoHeaderSummaryDto || raw.productPromo || {};

  return upper(
    product?.nature ??
      product?.promoType ??
      product?.promotionType ??
      promo.nature ??
      promo.promoType ??
      promo.promotionType ??
      raw.nature ??
      raw.promoType ??
      raw.promotionType
  );
}

function isFeatured(product) {
  const nature = getProductNature(product);
  return Boolean(
    product?.isHeadlineProduct ||
      product?.isTopProduct ||
      product?.isFeatured ||
      nature === "FLAGSHIP"
  );
}

function isPromo(product) {
  const nature = getProductNature(product);

  // Un produit phare reste dans Produits phares, même s'il a une remise.
  if (nature === "FLAGSHIP" || product?.isHeadlineProduct || product?.isTopProduct) {
    return false;
  }

  return Boolean(product?.isPromoProduct || nature === "PROMOTIONAL" || hasDiscount(product));
}

function isCatalog(product) {
  return product?.visibleInCatalog !== false;
}

function mergeFilters(params = {}, extraFilters = {}) {
  return {
    ...(params.fieldFilters || {}),
    ...extraFilters,
  };
}

function buildBody(params = {}, extraFilters = {}) {
  return buildSearchQuery({
    ...params,
    pageSize: params.pageSize || DEFAULT_PAGE_SIZE,
    fieldFilters: mergeFilters(params, extraFilters),
  });
}

function buildReadAllBody(params = {}, extraFilters = {}) {
  return buildSearchQuery({
    ...params,
    readAll: Boolean(params.readAll),
    pageSize: params.pageSize || STORE_SECTION_PAGE_SIZE,
    fieldFilters: mergeFilters(params, extraFilters),
  });
}

async function safePost(path, body, label = path) {
  try {
    return await http.post(path, body);
  } catch (err) {
    console.warn(`[productApi] ${label} failed:`, err);
    return null;
  }
}

async function safeGet(path, label = path) {
  try {
    return await http.get(path);
  } catch (err) {
    console.warn(`[productApi] ${label} failed:`, err);
    return null;
  }
}

function parseCountResponse(response) {
  if (typeof response === "number") return response;
  if (typeof response === "string") {
    const parsed = Number(response);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return Number(
    response?.count ??
      response?.total ??
      response?.totalItems ??
      response?.totalNumberOfItems ??
      0
  );
}

async function fetchPaged(path, params = {}, extraFilters = {}) {
  const body = buildBody(params, extraFilters);
  const response = await cachedRequest(`POST:${path}`, body, () => safePost(path, body, path));
  return normalizeResponse(response, params.pageSize || DEFAULT_PAGE_SIZE);
}

async function fetchAll(path, params = {}, extraFilters = {}) {
  const body = buildReadAllBody(params, extraFilters);
  const response = await cachedRequest(`POST:${path}`, body, () => safePost(path, body, path));
  return normalizeResponse(response, params.pageSize || STORE_SECTION_PAGE_SIZE).items;
}

async function fetchFirstAvailable(paths = [], params = {}, extraFilters = {}) {
  for (const path of paths) {
    const result = await fetchPaged(path, params, extraFilters);
    if (result.items.length > 0) return result;
  }

  return {
    items: [],
    totalItems: 0,
    totalPages: 0,
    page: Number(params.page || 0),
  };
}

async function fetchStorePool(storeId, params = {}) {
  const filters = { STORE_ID: [storeId] };
  const requestParams = {
    pageSize: params.pageSize || STORE_SECTION_PAGE_SIZE,
    storeName: params.storeName,
  };

  const [promoSearch, promoProjected, catalogSearch] = await Promise.all([
    fetchFirstAvailable(
      ["/api/client/catalog/products/search", "/api/client/catalog/products/search-all"],
      requestParams,
      filters
    ),
    fetchFirstAvailable(
      [
        "/api/client/catalog/products/projected/search",
        "/api/client/catalog/products/projected/search-all",
      ],
      requestParams,
      filters
    ),
    fetchFirstAvailable(
      ["/api/client/catalog/product/search", "/api/client/catalog/product/search-all"],
      requestParams,
      filters
    ),
  ]);

  let headlineProducts = [];
  const headlineResponse = await cachedRequest("GET:headline-products", {}, () =>
    safeGet("/api/client/catalog/products/headline-products", "headline-products")
  );

  if (headlineResponse) {
    headlineProducts = filterProductsByStore(
      mapItems(asArray(headlineResponse)),
      storeId,
      params.storeName
    );
  }

  const merged = uniqueProducts([
    ...promoSearch.items,
    ...promoProjected.items,
    ...catalogSearch.items,
    ...headlineProducts,
  ]);

  return filterProductsByStore(merged, storeId, params.storeName);
}

async function getSmallGlobalPool(params = {}) {
  const requestParams = {
    pageSize: params.pageSize || GLOBAL_POOL_PAGE_SIZE,
  };

  const [promoSearch, catalogSearch] = await Promise.all([
    fetchFirstAvailable(
      ["/api/client/catalog/products/search", "/api/client/catalog/products/search-all"],
      requestParams
    ),
    fetchFirstAvailable(
      ["/api/client/catalog/product/search", "/api/client/catalog/product/search-all"],
      requestParams
    ),
  ]);

  return uniqueProducts([...promoSearch.items, ...catalogSearch.items]);
}

// ─── Recherches génériques : Home, Marketplace, Catégories ───────────────────
export async function searchProducts(params = {}) {
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
  const primary = await fetchPaged("/api/client/catalog/products/search", {
    ...params,
    pageSize,
  });

  if (primary.items.length > 0 || !hasSpecificRequest(params)) {
    return primary;
  }

  // Fallback léger : uniquement si la recherche principale ne renvoie rien.
  const catalog = await fetchPaged("/api/client/catalog/product/search", {
    ...params,
    pageSize,
  });

  if (catalog.items.length > 0) return catalog;

  const smallPool = await getSmallGlobalPool({ pageSize: Math.max(pageSize, 80) });
  const filteredPool = applyLocalFilters(smallPool, params);

  return filteredPool.length > 0 ? paginate(filteredPool, params) : primary;
}

export async function searchAllProducts(params = {}) {
  const pool = await getSmallGlobalPool({ pageSize: params.pageSize || GLOBAL_POOL_PAGE_SIZE });
  return applyLocalFilters(pool, params);
}

export async function getAllProducts(params = {}) {
  return searchProducts({ pageSize: 24, ...params });
}

function buildFullTextBody(query, extraParams = {}) {
  const body = buildSearchQuery({
    page: extraParams.page || 0,
    pageSize: extraParams.pageSize || GLOBAL_POOL_PAGE_SIZE,
    readAll: extraParams.readAll ?? true,
    searchString: query,
    sortBy: extraParams.sortBy,
    sortDirection: extraParams.sortDirection,
    fieldFilters: extraParams.fieldFilters,
  });

  // Certains endpoints Wylov lisent `searchString`, d'autres utilisent un
  // nom plus générique. On envoie les alias sans casser les DTO tolérants.
  return {
    ...body,
    keyword: query,
    keywords: query,
    query,
    criteria: query,
  };
}

export async function fullTextSearchProducts(query, extraParams = {}) {
  const searchString = String(query || "").trim();

  if (!searchString) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: 0,
    };
  }

  const body = buildFullTextBody(searchString, extraParams);
  const fullTextPaths = [
    "/api/client/catalog/products/full-text-search",
    "/api/client/catalog/products/projected/full-text-search",
    "/api/client/catalog/product/full-text-search",
  ];

  for (const path of fullTextPaths) {
    const response = await cachedRequest(`POST:${path}`, body, () =>
      safePost(path, body, path)
    );
    const normalized = normalizeResponse(
      response,
      extraParams.pageSize || GLOBAL_POOL_PAGE_SIZE
    );

    if (normalized.items.length > 0) {
      return normalized;
    }
  }

  // Fallback API classique : toujours API, jamais données mockées.
  return searchProducts({
    ...extraParams,
    searchString,
    pageSize: extraParams.pageSize || GLOBAL_POOL_PAGE_SIZE,
  });
}

// ─── Sections globales de la page d'accueil ─────────────────────────────────
export async function getHomeProductSections(params = {}) {
  const limit = Number(params.limit || 12);
  const pageSize = Math.max(limit * 2, 24);

  const [promoResponse, featuredResponse, catalogResponse, headlineResponse] = await Promise.all([
    fetchPaged("/api/client/catalog/products/search", { pageSize }, { PRODUCT_NATURE: ["PROMOTIONAL"] }),
    fetchPaged("/api/client/catalog/products/search", { pageSize }, { PRODUCT_NATURE: ["FLAGSHIP"] }),
    fetchPaged("/api/client/catalog/product/search", { pageSize }, { VISIBLE_IN_CATALOG: ["true"] }),
    cachedRequest("GET:headline-products", {}, () =>
      safeGet("/api/client/catalog/products/headline-products", "headline-products")
    ),
  ]);

  const headlineProducts = headlineResponse ? mapItems(asArray(headlineResponse)) : [];
  const compactPool = uniqueProducts([
    ...promoResponse.items,
    ...featuredResponse.items,
    ...catalogResponse.items,
    ...headlineProducts,
  ]);

  const promoProducts = withSection(
    uniqueProducts(promoResponse.items.filter(isPromo).concat(compactPool.filter(isPromo))),
    "promo"
  );
  const featuredProducts = withSection(
    uniqueProducts(
      headlineProducts
        .concat(featuredResponse.items)
        .concat(compactPool.filter(isFeatured))
        .filter((product) => !isPromo(product))
    ),
    "featured"
  );
  const catalogProducts = withSection(
    uniqueProducts(
      withoutProducts(catalogResponse.items.filter(isCatalog).concat(compactPool.filter(isCatalog)), [
        ...promoProducts,
        ...featuredProducts,
      ])
    ),
    "catalog"
  );

  return {
    promoProducts: promoProducts.slice(0, limit),
    featuredProducts: featuredProducts.slice(0, limit),
    catalogProducts: catalogProducts.slice(0, limit),
  };
}

// ─── Produits d'un store sans search-by-criteria ─────────────────────────────
export async function getStoreProductSections(storeId, params = {}) {
  const pool = await fetchStorePool(storeId, {
    pageSize: params.pageSize || STORE_SECTION_PAGE_SIZE,
    storeName: params.storeName,
  });

  const promoProducts = withSection(
    uniqueProducts(pool.filter((product) => isPromo(product) && !isFeatured(product))),
    "promo"
  );
  const featuredProducts = withSection(
    uniqueProducts(pool.filter((product) => isFeatured(product) && !isPromo(product))),
    "featured"
  );
  const catalogProducts = withSection(
    uniqueProducts(pool.filter(isCatalog)),
    "catalog"
  );
  const allProducts = uniqueProducts([
    ...promoProducts,
    ...featuredProducts,
    ...catalogProducts,
  ]);

  console.log("[productApi] Sections produits store", {
    storeId,
    storeName: params.storeName,
    promo: promoProducts.length,
    featured: featuredProducts.length,
    catalog: catalogProducts.length,
    total: allProducts.length,
  });

  return {
    promoProducts,
    featuredProducts,
    catalogProducts,
    allProducts,
  };
}

export async function getStorePromoProducts(storeId, params = {}) {
  const sections = await getStoreProductSections(storeId, params);
  return {
    items: sections.promoProducts,
    totalItems: sections.promoProducts.length,
    totalPages: 1,
    page: 0,
  };
}

export async function getStoreHeadlineProducts(storeId, params = {}) {
  const sections = await getStoreProductSections(storeId, params);
  return {
    items: sections.featuredProducts,
    totalItems: sections.featuredProducts.length,
    totalPages: 1,
    page: 0,
  };
}

export async function getStoreCatalogProducts(storeId, params = {}) {
  const sections = await getStoreProductSections(storeId, params);
  return {
    items: sections.catalogProducts,
    totalItems: sections.catalogProducts.length,
    totalPages: 1,
    page: 0,
  };
}

export async function getProductsByStore(storeId, params = {}) {
  const sections = await getStoreProductSections(storeId, params);

  return {
    items: sections.allProducts,
    totalItems: sections.allProducts.length,
    totalPages: 1,
    page: 0,
  };
}

export async function getProductCountsByStore(params = {}) {
  const pool = await getSmallGlobalPool({
    pageSize: params.pageSize || GLOBAL_POOL_PAGE_SIZE,
  });

  const counts = new Map();

  uniqueProducts(pool).forEach((product) => {
    const storeId = getProductStoreId(product);
    if (!storeId) return;

    const key = String(storeId);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return counts;
}

export async function getProductCountForStore(storeId) {
  if (!storeId) return 0;

  const filters = { STORE_ID: [storeId] };
  const promoBody = buildSearchQuery({ pageSize: 1, fieldFilters: filters });
  const catalogBody = buildSearchQuery({ pageSize: 1, fieldFilters: filters });

  const [promoCountResponse, catalogCountResponse] = await Promise.all([
    cachedRequest(`COUNT:promo:${storeId}`, promoBody, () =>
      safePost("/api/client/catalog/products/count", promoBody, "products/count")
    ),
    cachedRequest(`COUNT:catalog:${storeId}`, catalogBody, () =>
      safePost("/api/client/catalog/product/count", catalogBody, "catalog/product/count")
    ),
  ]);

  const promoCount = parseCountResponse(promoCountResponse);
  const catalogCount = parseCountResponse(catalogCountResponse);

  return Math.max(0, promoCount) + Math.max(0, catalogCount);
}

export async function getProductCountsForStores(storeIds = []) {
  const requested = new Set(storeIds.filter(Boolean).map(String));
  const allCounts = await getProductCountsByStore({ pageSize: GLOBAL_POOL_PAGE_SIZE });

  if (requested.size === 0) return allCounts;

  const filteredCounts = new Map();
  requested.forEach((storeId) => {
    if (allCounts.has(storeId)) filteredCounts.set(storeId, allCounts.get(storeId));
  });

  return filteredCounts;
}

export async function getSimilarProducts(criteria = {}, params = {}) {
  const fieldFilters = {};
  if (criteria.productId) fieldFilters.PRODUCT = criteria.productId;
  if (criteria.categoryIds) fieldFilters.CATEGORY_ID = criteria.categoryIds;

  const response = await fetchPaged(
    "/api/client/catalog/products/get-products-of-the-same-categories",
    { pageSize: 4, ...params },
    fieldFilters
  );

  return response.items;
}

export async function countProducts(params = {}) {
  const response = await safePost("/api/client/catalog/products/count", buildSearchQuery(params));
  return typeof response === "number" ? response : response?.count ?? 0;
}

export async function getProductDetails(productId) {
  const response = await http.get(`/api/client/catalog/products/details/${productId}`);
  return mapProductFromApi(response);
}

export async function getHeadlineProducts() {
  const response = await cachedRequest("GET:headline-products", {}, () =>
    safeGet("/api/client/catalog/products/headline-products", "headline-products")
  );
  return response ? mapItems(asArray(response)) : [];
}

const productApi = {
  searchProducts,
  searchAllProducts,
  getAllProducts,
  fullTextSearchProducts,
  getHomeProductSections,
  getProductsByStore,
  getStorePromoProducts,
  getStoreHeadlineProducts,
  getStoreCatalogProducts,
  getStoreProductSections,
  getProductCountsByStore,
  getProductCountForStore,
  getProductCountsForStores,
  getSimilarProducts,
  countProducts,
  getProductDetails,
  getHeadlineProducts,
};

export default productApi;
