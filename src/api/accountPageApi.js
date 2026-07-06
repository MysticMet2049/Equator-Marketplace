import http, { buildSearchQuery } from "./httpClient";
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
    totalPages:
      Number(
        response.numberOfPages ??
          response.totalPages ??
          response.pageCount ??
          0
      ) || 0,
    page: Number(response.pageIndex ?? response.page ?? page) || 0,
    raw: response,
  };
}

function unwrapFavoriteProduct(item) {
  return (
    item?.productPromoHeaderSummaryDto ||
    item?.productPromoSummaryDto ||
    item?.productSummaryDto ||
    item?.product ||
    item
  );
}

function normalizeFavoriteProduct(item) {
  const dto = unwrapFavoriteProduct(item);
  const mapped = mapProductFromApi(dto);

  if (mapped) return mapped;

  return {
    ...dto,
    id: dto?.productId || dto?.id,
    productId: dto?.productId || dto?.id,
    name: dto?.name || "Produit",
    price: Number(dto?.price || dto?.amount || 0),
    storeId: dto?.storeId || dto?.store?.id || null,
    storeName: dto?.storeName || dto?.store?.name || null,
    coverAssetId: dto?.coverAssetId || dto?.assetId || null,
    assetIds: dto?.assetIds || [],
  };
}

/**
 * Données du compte actuellement connecté.
 */
export async function getAuthenticatedAccount() {
  return http.get("/api/accounts/authenticated");
}

/**
 * Produits favoris du client connecté.
 */
export async function getFavoriteProducts() {
  const response = await http.get("/api/client/catalog/products/favorite-products");
  return normalizeList(response).map(normalizeFavoriteProduct).filter(Boolean);
}

/**
 * Comptes/cartes liés aux enseignes du client connecté.
 */
export async function getLinkedCards({ page = 0, pageSize = 20 } = {}) {
  const response = await http.post(
    "/api/client/cards/paginated-linked-card-list",
    buildSearchQuery({
      page,
      pageSize,
      readAll: false,
    })
  );

  return normalizePagedResponse(response, page);
}

/**
 * Historique d'achats du compte client.
 */
export async function getPurchases(customerAccountId, { page = 0, pageSize = 20 } = {}) {
  if (!customerAccountId) return { ...EMPTY_PAGE, page };

  const response = await http.post(
    `/api/client/purchases/purchases-list/${customerAccountId}`,
    buildSearchQuery({
      page,
      pageSize,
      readAll: false,
    })
  );

  return normalizePagedResponse(response, page);
}

/**
 * Achats avec reste à payer / dette.
 */
export async function getPurchasesInDebt(customerAccountId, { page = 0, pageSize = 20 } = {}) {
  if (!customerAccountId) return { ...EMPTY_PAGE, page };

  const response = await http.post(
    `/api/client/purchases/purchases-list-in-debt/${customerAccountId}`,
    buildSearchQuery({
      page,
      pageSize,
      readAll: false,
    })
  );

  return normalizePagedResponse(response, page);
}

/**
 * Activité financière / transactions du client.
 */
export async function getFinancialTransactions({ page = 0, pageSize = 20 } = {}) {
  const response = await http.post(
    "/api/client/customer-account-financial-transactions/search",
    buildSearchQuery({
      page,
      pageSize,
      readAll: false,
    })
  );

  return normalizePagedResponse(response, page);
}

const accountPageApi = {
  getAuthenticatedAccount,
  getFavoriteProducts,
  getLinkedCards,
  getPurchases,
  getPurchasesInDebt,
  getFinancialTransactions,
};

export default accountPageApi;
