/**
 * reviewApi.js
 * Gestion des avis des boutiques côté client.
 *
 * Tant que le backend ne fournit pas un endpoint clair pour créer/lister
 * les commentaires détaillés d'une boutique, les nouveaux avis envoyés depuis
 * l'interface sont conservés en localStorage. Cela permet de valider le flow UI
 * sans inventer une route backend qui n'existe pas encore.
 */

const LOCAL_REVIEWS_KEY = "equator_store_reviews";

function readLocalReviewsStore() {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalReviewsStore(value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(value));
  } catch {
    // Le stockage local est optionnel : une erreur ne doit pas bloquer l'UI.
  }
}

function getCurrentDateLabel() {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function normalizeReview(apiReview) {
  if (!apiReview || typeof apiReview !== "object") return null;

  const customer =
    apiReview.customer ||
    apiReview.client ||
    apiReview.user ||
    apiReview.author ||
    apiReview.createdBy ||
    apiReview.customerSummaryDto ||
    apiReview.userSummaryDto ||
    {};

  const name =
    apiReview.name ||
    apiReview.customerName ||
    apiReview.clientName ||
    apiReview.authorName ||
    apiReview.fullName ||
    customer.fullName ||
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    customer.name ||
    "Client";

  const rating = Number(
    apiReview.rating ??
      apiReview.note ??
      apiReview.score ??
      apiReview.stars ??
      apiReview.value ??
      0
  );

  const text =
    apiReview.comment ||
    apiReview.text ||
    apiReview.message ||
    apiReview.description ||
    apiReview.review ||
    apiReview.content ||
    "";

  const rawDate =
    apiReview.date ||
    apiReview.createdAt ||
    apiReview.createdDate ||
    apiReview.updatedAt ||
    "";

  return {
    id:
      apiReview.id ||
      apiReview.reviewId ||
      apiReview.ratingId ||
      `local-review-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    avatar: apiReview.avatar || name?.charAt(0)?.toUpperCase() || "C",
    rating: Number.isFinite(rating) ? rating : 0,
    text,
    date: formatReviewDate(rawDate),
    _raw: apiReview,
  };
}

export function normalizeReviewList(value) {
  const candidates = [
    value,
    value?.reviews,
    value?.storeReviews,
    value?.ratings,
    value?.comments,
    value?.ratingInfo?.reviews,
    value?.ratingInfo?.comments,
    value?.content,
    value?.content?.items,
    value?.content?.summaryDtos,
    value?.data,
    value?.data?.items,
    value?.data?.summaryDtos,
    value?._raw?.reviews,
    value?._raw?.storeReviews,
    value?._raw?.ratings,
    value?._raw?.comments,
    value?._raw?.ratingInfo?.reviews,
    value?._raw?.ratingInfo?.comments,
  ];

  const list = candidates.find(Array.isArray) || [];
  return list.map(normalizeReview).filter(Boolean);
}

export function buildRatingBreakdown(reviews = []) {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    const rounded = Math.max(1, Math.min(5, Math.round(Number(review.rating || 0))));
    breakdown[rounded] += 1;
  });

  return breakdown;
}

export function getLocalStoreReviews(storeId) {
  if (!storeId) return [];
  const store = readLocalReviewsStore();
  const list = store[String(storeId)] || [];
  return normalizeReviewList(list);
}

export async function getStoreReviews(store) {
  if (!store) return [];

  const storeId = store.id || store.storeId;
  const embeddedReviews = normalizeReviewList(store);
  const localReviews = getLocalStoreReviews(storeId);

  const seen = new Set();
  return [...localReviews, ...embeddedReviews].filter((review) => {
    const key = String(review.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function createStoreReview({ storeId, rating, comment, authorName } = {}) {
  if (!storeId) {
    throw new Error("Boutique introuvable pour l'avis.");
  }

  const safeComment = String(comment || "").trim();

  if (!safeComment) {
    throw new Error("Veuillez saisir un commentaire avant d'envoyer votre avis.");
  }

  const safeRating = Math.max(1, Math.min(5, Number(rating || 5)));
  const review = normalizeReview({
    id: `local-review-${storeId}-${Date.now()}`,
    name: authorName || "Vous",
    rating: safeRating,
    comment: safeComment,
    date: getCurrentDateLabel(),
  });

  const store = readLocalReviewsStore();
  const key = String(storeId);
  store[key] = [review, ...(store[key] || [])];
  writeLocalReviewsStore(store);

  return review;
}

function formatReviewDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const reviewApi = {
  getStoreReviews,
  createStoreReview,
  normalizeReview,
  normalizeReviewList,
  buildRatingBreakdown,
  getLocalStoreReviews,
};

export default reviewApi;
