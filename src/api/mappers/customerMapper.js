/**
 * customerMapper.js
 * Transforms customer/user/purchase backend DTOs into clean frontend objects.
 */

// ─── Customer ─────────────────────────────────────────────────────────────────
/**
 * Map StorecardCustomerSummaryDto (from /api/customers/current) → clean customer object.
 *
 * Backend shape:
 *   id, personalInfo: { firstName, lastName, email, fullName, gender, birthDate },
 *   registrationDate, lastActivatedAt, status,
 *   address: AddressSummaryDto { street, postalCode, countryName, countryShortName, ... },
 *   user: StorecardUserSummaryDto { login, mobileNumber, imageUrl, ... }
 *
 * NOTE: AddressSummaryDto does not expose a dedicated "city" field in the
 * OpenAPI schema — only street, postalCode, countryName, countryShortName.
 * Adjust `address` below once the backend confirms whether city lives
 * under `quarter` or elsewhere.
 */
export function mapCustomerFromApi(apiCustomer) {
  if (!apiCustomer) return null;
  const info = apiCustomer.personalInfo ?? {};
  const user = apiCustomer.user ?? {};
  const address = apiCustomer.address ?? {};

  return {
    id: apiCustomer.id,
    login: user.login ?? apiCustomer.login ?? info.email ?? "",
    name: info.fullName ?? `${info.firstName ?? ""} ${info.lastName ?? ""}`.trim(),
    firstName: info.firstName ?? "",
    lastName: info.lastName ?? "",
    email: info.email ?? "",
    phone: user.mobileNumber ?? apiCustomer.mobileNumber ?? "",
    birthDate: info.birthDate ?? null,
    gender: info.gender ?? null,
    avatar: user.imageUrl ?? apiCustomer.imageUrl ?? null,
    status: apiCustomer.status ?? null,
    registrationDate: apiCustomer.registrationDate ?? null,
    address: {
      street: address.street ?? "",
      postalCode: address.postalCode ?? "",
      country: address.countryName ?? "",
      countryShortName: address.countryShortName ?? "",
    },
    _raw: apiCustomer,
  };
}

// ─── User (auth) ──────────────────────────────────────────────────────────────
/**
 * Map UserSummaryDto (returned by /api/auth/login, /api/accounts/get-account)
 * → clean user object used in AuthContext.
 *
 * Backend fields:
 *   id, login, mobileNumber, imageUrl,
 *   personalInfo: { firstName, lastName, email, fullName, gender, birthDate }
 *
 * Kept distinct from mapCustomerFromApi because the auth endpoints return a
 * different (flatter) DTO than /api/customers/current.
 */
export function mapUserFromApi(apiUser) {
  if (!apiUser) return null;
  const info = apiUser.personalInfo ?? {};
  return {
    id: apiUser.id,
    login: apiUser.login,
    name: info.fullName ?? `${info.firstName ?? ""} ${info.lastName ?? ""}`.trim(),
    firstName: info.firstName ?? "",
    lastName: info.lastName ?? "",
    email: info.email ?? "",
    phone: apiUser.mobileNumber ?? "",
    avatar: apiUser.imageUrl ?? null,
    activated: apiUser.activated ?? false,
    roles: apiUser.roles ?? [],
    currentRole: apiUser.currentRole ?? null,
    language: apiUser.language ?? "fr",
    _raw: apiUser,
  };
}

// ─── Purchase ─────────────────────────────────────────────────────────────────
/**
 * Map ClientPurchaseSummaryDto (from purchaseApi.js) → clean purchase object.
 *
 * Real backend shape confirmed from OpenAPI:
 *   id, amount, purchaseDate, storeId, storeName, salesId,
 *   remainingToBePaid, employeeFirstName, employeeLastName
 *
 * This DTO is flat — no nested `purchaseItems` array and no explicit
 * `status` enum field. Status is derived here from `remainingToBePaid`:
 * > 0 means an outstanding debt ("En cours"), otherwise considered fully
 * settled ("Livré"). Adjust this heuristic if the backend later exposes
 * a real status field.
 */
export function mapPurchaseFromApi(apiPurchase) {
  if (!apiPurchase) return null;
  const remaining = apiPurchase.remainingToBePaid ?? 0;

  return {
    id: apiPurchase.id,
    reference: `#${apiPurchase.id}`,
    date: apiPurchase.purchaseDate ?? "",
    storeName: apiPurchase.storeName ?? "",
    storeId: apiPurchase.storeId ?? null,
    salesId: apiPurchase.salesId ?? null,
    total: apiPurchase.amount ?? 0,
    remainingAmount: remaining,
    hasDebt: remaining > 0,
    status: remaining > 0 ? "En cours" : "Livré",
    employeeName: [apiPurchase.employeeFirstName, apiPurchase.employeeLastName]
      .filter(Boolean)
      .join(" "),
    _raw: apiPurchase,
  };
}

export default mapCustomerFromApi;
