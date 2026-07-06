export const STATUS_STYLES = {
  Livré: { bg: "#dcfce7", color: "#15803d" },
  "En cours": { bg: "#dbeafe", color: "#1d4ed8" },
  Annulé: { bg: "#fee2e2", color: "#dc2626" },
  Payé: { bg: "#dcfce7", color: "#15803d" },
  Impayé: { bg: "#fee2e2", color: "#dc2626" },
  PENDING: { bg: "#fef3c7", color: "#b45309" },
  COMPLETED: { bg: "#dcfce7", color: "#15803d" },
  CANCELED: { bg: "#fee2e2", color: "#dc2626" },
};

export function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

export function getDisplayText(value, fallback = "Non renseigné") {
  if (value === undefined || value === null || value === "") return fallback;
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);

  if (typeof value === "object") {
    const direct = value.name || value.label || value.title || value.value || value.fullName || value.email || value.number || value.fullNumber;
    if (direct) return String(direct);

    const parts = [value.firstName, value.lastName, value.street, value.city, value.countryName, value.country].filter(Boolean);
    return parts.length ? parts.join(" ") : fallback;
  }

  return fallback;
}

export function getProfile(user, account) {
  const personalInfo = account?.personalInfo || account?.user?.personalInfo || account?.customer?.personalInfo || user?.personalInfo || {};
  const phoneObject = account?.mobileNumber || account?.phone || account?.principalPhoneNumber || personalInfo?.phone || personalInfo?.mobileNumber || user?.phone || user?.mobileNumber;
  const firstName = firstValue(personalInfo.firstName, account?.firstName, user?.firstName);
  const lastName = firstValue(personalInfo.lastName, account?.lastName, user?.lastName);
  const fullName = firstValue(user?.name, account?.name, account?.fullName, `${firstName || ""} ${lastName || ""}`.trim(), account?.login, user?.login, "Utilisateur");

  return {
    name: fullName,
    email: firstValue(user?.email, personalInfo.email, account?.email, account?.user?.login, account?.login, ""),
    phone: typeof phoneObject === "object" ? firstValue(phoneObject.fullNumber, phoneObject.number, "") : firstValue(phoneObject, ""),
    username: firstValue(user?.login, account?.login, account?.user?.login, fullName),
  };
}

export function formatMoney(value, currency = "FCFA") {
  return `${Number(value || 0).toLocaleString("fr-FR")} ${currency}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("fr-FR");
}

export function getCardName(card) {
  const organisation = card.organisation || card.organisationSummaryDto || card.store || card.storeSummaryDto || card.brand || {};
  return firstValue(card.storeName, card.organisationName, card.name, organisation.name, organisation.storeName, "Enseigne");
}

export function getCardBalance(card) {
  return Number(firstValue(card.balance, card.amount, card.currentBalance, card.accountBalance, card.customerBalance, card.remainingAmount, 0));
}

export function getCardPoints(card) {
  return Number(firstValue(card.points, card.loyaltyPoints, card.rewardPoints, card.currentPoints, 0));
}

export function getCardDebt(card) {
  return Number(firstValue(card.debt, card.remainingDebt, card.amountInDebt, card.unpaidAmount, 0));
}

export function getPurchaseId(order) {
  return firstValue(order.reference, order.code, order.purchaseCode, order.id, "—");
}

export function getPurchaseDate(order) {
  return firstValue(order.purchaseDate, order.date, order.createdAt, order.createdDate);
}

export function getPurchaseStore(order) {
  const store = order.store || order.organisation || order.merchant || {};
  return firstValue(order.storeName, order.organisationName, store.name, "Boutique");
}

export function getPurchaseStatus(order) {
  return firstValue(order.status, order.purchaseStatus, order.paymentStatus, "En cours");
}

export function getPurchaseTotal(order) {
  return Number(firstValue(order.totalAmount, order.total, order.amount, order.totalPrice, order.price, 0));
}

export function getTransactionLabel(item) {
  return firstValue(item.label, item.title, item.description, item.transactionType, item.type, "Activité du compte");
}

export function getTransactionDate(item) {
  return firstValue(item.date, item.createdAt, item.transactionDate, item.createdDate);
}

export function getTransactionAmount(item) {
  return Number(firstValue(item.amount, item.value, item.balanceVariation, 0));
}
