/**
 * purchaseApi.js
 * Purchase history services.
 *
 * Covers:
 *   POST /api/client/purchases/purchases-list/{customerAccountId}
 *   POST /api/client/purchases/purchases-list-in-debt/{customerAccountId}
 *
 * Backend response item shape (ClientPurchaseSummaryDto):
 *   id, amount, purchaseDate, storeId, storeName, salesId,
 *   remainingToBePaid, employeeFirstName, employeeLastName
 *
 * NOTE: this DTO is flatter than what mapPurchaseFromApi() in mappers.js
 * originally assumed (no nested `purchaseItems`/`status` field is exposed
 * here — only a running balance via `remainingToBePaid`). mapPurchaseFromApi
 * has been adjusted accordingly; status is now derived from
 * remainingToBePaid > 0 instead of a dedicated backend status field,
 * since none exists in this DTO.
 */

import http, { buildSearchQuery, normalizePaginatedResponse } from "./httpClient";
import { mapPurchaseFromApi } from "./mappers/mappers";

// ─── Purchase history ──────────────────────────────────────────────────────────
/**
 * Get the full purchase history for a customer account.
 * Used by ProfilePage / PurchaseHistoryPage.
 * @param {number|string} customerAccountId
 * @param {object} params — pagination / sort overrides
 */
export async function getPurchaseHistory(customerAccountId, params = {}) {
  const body = buildSearchQuery({ pageSize: 10, sortBy: "purchaseDate", sortDirection: "DESC", ...params });
  const response = await http.post(
    `/api/client/purchases/purchases-list/${customerAccountId}`,
    body
  );
  const normalized = normalizePaginatedResponse(response, params.pageSize);
  return { ...normalized, items: normalized.items.map(mapPurchaseFromApi) };
}

/**
 * Get purchases that still have an outstanding debt (remainingToBePaid > 0).
 * Used to show "unpaid orders" in ProfilePage.
 *
 * NOTE: this endpoint's request body (BreakdownDebtRequest) differs from the
 * standard search DTO — it expects employeeId / storeIds / debtPart rather
 * than searchString / fieldFilters. Pass storeIds explicitly if filtering
 * by store is needed; otherwise an empty array returns all stores.
 *
 * @param {number|string} customerAccountId
 * @param {{ employeeId?: number, storeIds?: number[], debtPart?: string, sortBy?: string, sortDirection?: string, pageIndex?: number, numberOfItemsPerPage?: number }} params
 */
export async function getPurchasesInDebt(customerAccountId, params = {}) {
  const {
    employeeId = null,
    storeIds = [],
    debtPart = "ALL",
    sortBy = "purchaseDate",
    sortDirection = "DESC",
    pageIndex = 0,
    numberOfItemsPerPage = 10,
  } = params;

  const body = {
    employeeId,
    customerAccountId,
    storeIds,
    debtPart,
    sortBy,
    sortDirection,
    pageIndex,
    numberOfItemsPerPage,
    storeArray: storeIds,
  };

  const response = await http.post(
    `/api/client/purchases/purchases-list-in-debt/${customerAccountId}`,
    body
  );
  const normalized = normalizePaginatedResponse(response, numberOfItemsPerPage);
  return { ...normalized, items: normalized.items.map(mapPurchaseFromApi) };
}

const purchaseApi = {
  getPurchaseHistory,
  getPurchasesInDebt,
};

export default purchaseApi;