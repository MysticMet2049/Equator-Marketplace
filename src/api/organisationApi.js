/**
 * organisationApi.js
 * Organisation services.
 *
 * Covers:
 *   POST /api/client/organisations/where-i-am-registered
 *   POST /api/client/organisations/search-by-criteria/
 *   GET  /api/client/organisations/get-rebate-configurations/{customerAccountId}
 *
 * NOTE: /api/client/organisations/where-i-am-registered has no documented
 * request body in the OpenAPI file (likely resolves the organisations
 * implicitly from the authenticated user/customer). It is called here
 * with an empty POST body; adjust if the backend actually expects a
 * payload once confirmed.
 */

import http, { normalizePaginatedResponse } from "./httpClient";

// ─── Where am I registered ────────────────────────────────────────────────────
/**
 * Retrieve the organisations the current customer is registered in.
 * Used by ProfilePage to show linked organisations/loyalty programs.
 */
export async function getMyOrganisations() {
  const response = await http.post("/api/client/organisations/where-i-am-registered", {});
  const { items } = normalizePaginatedResponse(response);
  return items.map(mapOrganisationFromApi);
}

// ─── Search ───────────────────────────────────────────────────────────────────
/**
 * Search organisations by criteria.
 * NOTE: body uses the generic SearchQueryDto shape; `sortBy` is typed as a
 * QueryField object rather than a plain string in this specific endpoint —
 * pass a string for now (matches the simpler usage pattern elsewhere) and
 * adjust if the backend rejects it.
 * @param {{ page?: number, pageSize?: number, searchString?: string, sortBy?: string, sortDirection?: string, fieldFilters?: object }} params
 */
export async function searchOrganisations({
  page = 0,
  pageSize = 12,
  searchString = "",
  sortBy = "",
  sortDirection = "DESC",
  fieldFilters = {},
} = {}) {
  const body = {
    pageIndex: page,
    startIndex: page * pageSize,
    numberOfItemsPerPage: pageSize,
    searchString,
    sortBy,
    sortDirection,
    fieldFilters,
    readAll: false,
    definedFilters: [],
  };
  const response = await http.post("/api/client/organisations/search-by-criteria/", body);
  const normalized = normalizePaginatedResponse(response, pageSize);
  return { ...normalized, items: normalized.items.map(mapOrganisationFromApi) };
}

// ─── Rebate configurations ─────────────────────────────────────────────────────
/**
 * Get the rebate/discount configurations for a customer account.
 * @param {number|string} customerAccountId
 */
export async function getRebateConfigurations(customerAccountId) {
  return http.get(`/api/client/organisations/get-rebate-configurations/${customerAccountId}`);
}

// ─── Mapping ──────────────────────────────────────────────────────────────────
/**
 * Map ClientOrganisationHeaderInfoSummaryDto → clean organisation object.
 *
 * Backend shape:
 *   id, organisationSummaryDto: { ... }, address, organisationLogoAssetId,
 *   customerCard: { ... }
 */
function mapOrganisationFromApi(apiOrg) {
  if (!apiOrg) return null;
  const org = apiOrg.organisationSummaryDto ?? {};
  const address = apiOrg.address ?? {};

  return {
    id: apiOrg.id,
    name: org.name ?? "",
    logoAssetId: apiOrg.organisationLogoAssetId ?? null,
    location: [address.street, address.countryName].filter(Boolean).join(", ") || null,
    cardNumber: apiOrg.customerCard?.cardNumber ?? null,
    _raw: apiOrg,
  };
}

const organisationApi = {
  getMyOrganisations,
  searchOrganisations,
  getRebateConfigurations,
};

export default organisationApi;