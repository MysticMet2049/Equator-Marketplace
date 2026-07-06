/**
 * shared.js
 * Utilities shared across all mapper modules (asset URLs, slugify, badges).
 * Kept separate so productMapper / storeMapper / cartMapper / customerMapper
 * stay focused on a single entity each, without duplicating helpers.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://www.wylov.com:8081";

// ─── Asset URL helper ─────────────────────────────────────────────────────────
/**
 * Best-effort direct URL builder for an asset.
 *
 * ⚠️ CAVEAT: /api/client/assets/download/{assetId} is documented as a POST
 * endpoint returning a `string` body (likely a presigned URL or base64
 * payload) — NOT a plain authenticated GET you can drop into <img src="">.
 * This helper still builds a same-shaped URL as a pragmatic fallback for
 * <img> tags, which may work if the backend also accepts GET on that path;
 * if images don't load, switch callers to `assetApi.fetchAssetUrl()`
 * (proper POST call) and use the resolved string as the img src instead.
 */
export function assetUrl(assetId, fallback = null) {
  if (!assetId) return fallback;
  return `${BASE_URL}/api/client/assets/download/${assetId}`;
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Product badge helper ─────────────────────────────────────────────────────
export function deriveBadge(promo) {
  if (!promo) return null;
  if (promo.discountPercentage && promo.discountPercentage > 0) {
    return `-${Math.round(promo.discountPercentage)}%`;
  }
  if (promo.isTopProduct) return "Top";
  if (promo.nature === "NEW") return "NOUVEAU";
  return null;
}
