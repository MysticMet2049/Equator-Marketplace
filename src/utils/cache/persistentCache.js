/**
 * Persistent cache utilities for Equator read-only data.
 *
 * The cache combines three layers:
 * - in-memory Map for instant navigation inside the same tab;
 * - localStorage for page reloads or back/forward navigation;
 * - promise de-duplication so several components sharing the same request
 *   reuse one network call instead of launching duplicates.
 *
 * Use this only for read-only data such as product lists, store lists and
 * store/product details. Do not cache cart mutations, login, registration,
 * checkout or any write operation.
 */

const CACHE_PREFIX = "equator:data-cache:v1:";
const DEFAULT_TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map();
const pendingRequests = new Map();

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function stableStringify(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

export function createCacheKey(scope, payload = {}) {
  return `${CACHE_PREFIX}${scope}:${stableStringify(payload)}`;
}

function isExpired(entry) {
  return !entry || Date.now() > Number(entry.expiresAt || 0);
}

export function readCache(cacheKey) {
  const memoryEntry = memoryCache.get(cacheKey);
  if (memoryEntry && !isExpired(memoryEntry)) return memoryEntry.value;
  if (memoryEntry) memoryCache.delete(cacheKey);

  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (isExpired(entry)) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    memoryCache.set(cacheKey, entry);
    return entry.value;
  } catch {
    return null;
  }
}

export function writeCache(cacheKey, value, ttlMs = DEFAULT_TTL_MS) {
  const entry = {
    createdAt: Date.now(),
    expiresAt: Date.now() + Number(ttlMs || DEFAULT_TTL_MS),
    value,
  };

  memoryCache.set(cacheKey, entry);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch {
      // Storage quota can be exceeded on image-heavy pages. The memory cache
      // still works, so failing to persist should not block the app.
    }
  }

  return value;
}

export function removeCache(cacheKey) {
  memoryCache.delete(cacheKey);
  pendingRequests.delete(cacheKey);

  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(cacheKey);
    } catch {
      // No-op.
    }
  }
}

export function clearEquatorCache() {
  memoryCache.clear();
  pendingRequests.clear();

  if (!canUseStorage()) return;

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
}

export async function cachedAsync(scope, payload, loader, { ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = createCacheKey(scope, payload);
  const cached = readCache(cacheKey);

  if (cached !== null && cached !== undefined) return cached;

  const pending = pendingRequests.get(cacheKey);
  if (pending) return pending;

  const request = Promise.resolve()
    .then(loader)
    .then((value) => {
      pendingRequests.delete(cacheKey);
      return writeCache(cacheKey, value, ttlMs);
    })
    .catch((error) => {
      pendingRequests.delete(cacheKey);
      throw error;
    });

  pendingRequests.set(cacheKey, request);
  return request;
}

export default {
  cachedAsync,
  clearEquatorCache,
  createCacheKey,
  readCache,
  removeCache,
  stableStringify,
  writeCache,
};
