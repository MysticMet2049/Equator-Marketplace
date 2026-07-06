import http, { ApiError } from "./httpClient";

function normalizeId(value) {
  return value === undefined || value === null || value === "" ? null : String(value);
}

function getProductId(productOrId) {
  if (typeof productOrId === "string" || typeof productOrId === "number") return normalizeId(productOrId);

  return normalizeId(
    productOrId?.productId ||
      productOrId?.refId ||
      productOrId?.id ||
      productOrId?.promoId ||
      productOrId?.summaryId ||
      null
  );
}

function templatePath(pathTemplate, params) {
  if (!pathTemplate) return null;

  return pathTemplate
    .replace(/\{productId\}|:productId/g, encodeURIComponent(params.productId))
    .replace(/\{refId\}|:refId/g, encodeURIComponent(params.productId));
}

function ratingBody(productId, rating) {
  return {
    productId: Number(productId),
    refId: Number(productId),
    refType: "PRODUCT",
    rating: Number(rating),
    rate: Number(rating),
    stars: Number(rating),
    value: Number(rating),
  };
}

export function hasConfiguredProductRatingEndpoint() {
  return Boolean(import.meta.env.VITE_PRODUCT_RATING_ENDPOINT);
}

export async function rateProduct(productOrId, rating) {
  const productId = getProductId(productOrId);
  const safeRating = Number(rating);

  if (!productId) throw new ApiError(400, "Identifiant du produit introuvable.", null);
  if (!Number.isFinite(safeRating) || safeRating < 1 || safeRating > 5) {
    throw new ApiError(400, "La note doit être comprise entre 1 et 5.", null);
  }

  const configuredPath = templatePath(import.meta.env.VITE_PRODUCT_RATING_ENDPOINT || "", { productId });
  const method = String(import.meta.env.VITE_PRODUCT_RATING_METHOD || "POST").toLowerCase();
  const body = ratingBody(productId, safeRating);

  if (!configuredPath) {
    return { success: true, localOnly: true, rating: safeRating };
  }

  if (!["post", "put", "patch"].includes(method)) {
    throw new ApiError(400, "La configuration de notation est invalide.", null);
  }

  return http[method](configuredPath, body);
}

export default {
  hasConfiguredProductRatingEndpoint,
  rateProduct,
};
