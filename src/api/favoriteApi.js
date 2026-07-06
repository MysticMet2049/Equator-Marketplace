import http, { ApiError } from "./httpClient";
import { mapProductFromApi } from "./mappers/productMapper";

const EMPTY_PAGE = {
  items: [],
  totalItems: 0,
  totalPages: 0,
  page: 0,
};

function normalizeList(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.summaryDtos)) return response.summaryDtos;
  if (Array.isArray(response.content)) return response.content;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.results)) return response.results;
  return [];
}

function normalizePagedResponse(response, page = 0) {
  if (!response) return { ...EMPTY_PAGE, page };

  const items = normalizeList(response);

  return {
    items,
    totalItems:
      Number(
        response.totalNumberOfItems ??
          response.totalItems ??
          response.totalElements ??
          response.total ??
          items.length
      ) || 0,
    totalPages: Number(response.numberOfPages ?? response.totalPages ?? response.pageCount ?? 0) || 0,
    page: Number(response.pageIndex ?? response.page ?? page) || 0,
    raw: response,
  };
}

function unwrapFavoriteProduct(item) {
  return (
    item?.productPromoHeaderSummaryDto ||
    item?.productPromoSummaryDto ||
    item?.productHeaderSummaryDto ||
    item?.productSummaryDto ||
    item?.product ||
    item
  );
}

function normalizeFavoriteProduct(item) {
  const dto = unwrapFavoriteProduct(item);
  const mapped = mapProductFromApi(dto);

  if (mapped) {
    return {
      ...mapped,
      isFavorite: true,
      userPreferenceSummaryDto: {
        ...(mapped.userPreferenceSummaryDto || item?.userPreferenceSummaryDto || {}),
        refId: mapped.productId || mapped.id,
        refType: "PRODUCT",
        isFavorite: true,
      },
    };
  }

  if (!dto) return null;

  const productId = dto.productId || dto.refId || dto.id;

  return {
    ...dto,
    id: productId,
    productId,
    name: dto.name || "Produit",
    price: Number(dto.price || dto.amount || dto.newPrice || dto.promoPrice || dto.listPrice || 0),
    storeId: dto.storeId || dto.store?.id || null,
    storeName: dto.storeName || dto.store?.name || null,
    coverAssetId: dto.coverAssetId || dto.assetId || null,
    assetIds: dto.assetIds || [],
    isFavorite: true,
    userPreferenceSummaryDto: {
      ...(dto.userPreferenceSummaryDto || item?.userPreferenceSummaryDto || {}),
      refId: productId,
      refType: "PRODUCT",
      isFavorite: true,
    },
  };
}

function getProductId(productOrId) {
  if (typeof productOrId === "string" || typeof productOrId === "number") return productOrId;

  return (
    productOrId?.productId ||
    productOrId?.refId ||
    productOrId?.id ||
    productOrId?.promoId ||
    productOrId?.summaryId ||
    productOrId?.productPromoSummaryDto?.productId ||
    productOrId?.productPromoHeaderSummaryDto?.productId ||
    null
  );
}

function templatePath(pathTemplate, params) {
  if (!pathTemplate) return null;

  return pathTemplate
    .replace(/\{productId\}|:productId/g, encodeURIComponent(params.productId))
    .replace(/\{refId\}|:refId/g, encodeURIComponent(params.productId));
}

function getConfiguredEndpoint(kind) {
  const key = kind === "add" ? "VITE_FAVORITE_PRODUCT_ADD_ENDPOINT" : "VITE_FAVORITE_PRODUCT_REMOVE_ENDPOINT";
  return (import.meta.env[key] || "").trim();
}

function getConfiguredMethod(kind) {
  const key = kind === "add" ? "VITE_FAVORITE_PRODUCT_ADD_METHOD" : "VITE_FAVORITE_PRODUCT_REMOVE_METHOD";
  return String(import.meta.env[key] || (kind === "add" ? "post" : "delete")).toLowerCase();
}

export function hasConfiguredFavoriteMutationEndpoint(kind = "add") {
  return Boolean(getConfiguredEndpoint(kind));
}

function favoriteBody(productId, favorite) {
  return {
    productId: Number(productId),
    refId: Number(productId),
    refType: "PRODUCT",
    isFavorite: favorite,
  };
}

async function runConfiguredFavoriteMutation(kind, productId) {
  const endpoint = templatePath(getConfiguredEndpoint(kind), { productId });
  const method = getConfiguredMethod(kind);
  const body = favoriteBody(productId, kind === "add");

  if (!endpoint) {
    throw new ApiError(
      501,
      "Favori enregistré localement. L'endpoint backend d'ajout/suppression n'est pas configuré.",
      { localOnly: true }
    );
  }

  if (method === "delete") return http.delete(endpoint);
  if (method === "put") return http.put(endpoint, body);
  return http.post(endpoint, body);
}

async function runFavoriteMutation(kind, productOrId) {
  const productId = getProductId(productOrId);

  if (!productId) {
    throw new ApiError(400, "Identifiant du produit introuvable.", null);
  }

  return runConfiguredFavoriteMutation(kind, productId);
}

export async function getFavoriteProducts({ page = 0, pageSize = 50 } = {}) {
  const query = {
    page,
    pageSize,
    pageIndex: page,
    numberOfItemsPerPage: pageSize,
  };

  const response = await http.get("/api/client/catalog/products/favorite-products", { query });
  const normalized = normalizePagedResponse(response, page);

  return {
    ...normalized,
    items: normalized.items.map(normalizeFavoriteProduct).filter(Boolean),
  };
}

export async function addProductToFavorites(productOrId) {
  return runFavoriteMutation("add", productOrId);
}

export async function removeProductFromFavorites(productOrId) {
  return runFavoriteMutation("remove", productOrId);
}

export async function setProductFavorite(productOrId, favorite) {
  return favorite ? addProductToFavorites(productOrId) : removeProductFromFavorites(productOrId);
}

export default {
  getFavoriteProducts,
  addProductToFavorites,
  removeProductFromFavorites,
  setProductFavorite,
};
