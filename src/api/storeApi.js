/**
 * storeApi.js
 * Services boutiques Equator / WYLov.
 */

import http, { buildSearchQuery, normalizePaginatedResponse } from "./httpClient";
import { mapStoreFromApi } from "./mappers/mappers";
import { cachedAsync } from "../utils/cache/persistentCache";

const STORE_CACHE_TTL = 5 * 60 * 1000;

function cachedStoreRequest(label, payload, loader) {
  return cachedAsync(`store:${label}`, payload, loader, { ttlMs: STORE_CACHE_TTL });
}

function normalizeStorePage(response, pageSize) {
  const normalized = normalizePaginatedResponse(response, pageSize);
  return {
    ...normalized,
    items: (normalized.items || []).map(mapStoreFromApi).filter(Boolean),
  };
}

async function postStorePage(path, params = {}) {
  const body = buildSearchQuery(params);

  return cachedStoreRequest(path, body, async () => {
    const response = await http.post(path, body);
    return normalizeStorePage(response, params.pageSize);
  });
}

async function safePostStorePage(path, params = {}) {
  try {
    return await postStorePage(path, params);
  } catch (error) {
    console.warn(`[storeApi] ${path} indisponible, fallback utilisé si possible.`, error);
    return { items: [], totalItems: 0, totalPages: 0, page: 0 };
  }
}

export async function getTopStores(params = {}) {
  const pageSize = params.pageSize || 8;

  const topStores = await safePostStorePage("/api/client/stores/top-stores", {
    ...params,
    pageSize,
  });

  if (topStores.items.length > 0) return topStores.items;

  const allStores = await safePostStorePage("/api/client/stores/all-stores", {
    ...params,
    pageSize,
  });

  return allStores.items;
}

export async function getHeadlineStores(params = {}) {
  const pageSize = params.pageSize || 6;

  const headlineStores = await safePostStorePage("/api/client/stores/headlines-stores", {
    ...params,
    pageSize,
  });

  if (headlineStores.items.length > 0) return headlineStores.items;

  const topStores = await safePostStorePage("/api/client/stores/top-stores", {
    ...params,
    pageSize,
  });

  if (topStores.items.length > 0) return topStores.items;

  const allStores = await safePostStorePage("/api/client/stores/all-stores", {
    ...params,
    pageSize,
  });

  return allStores.items;
}

export async function searchStores(params = {}) {
  return postStorePage("/api/client/stores/search", params);
}

export async function searchAllStores(params = {}) {
  const body = buildSearchQuery({ ...params, readAll: true });
  const response = await http.post("/api/client/stores/search-all", body);
  const normalized = normalizePaginatedResponse(response);
  return (normalized.items || []).map(mapStoreFromApi).filter(Boolean);
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function storeMatchesQuery(store, query) {
  const search = normalizeSearchText(query);
  if (!search) return true;

  const text = normalizeSearchText(
    [
      store.name,
      store.storeName,
      store.description,
      store.tagline,
      store.category,
      store.location,
      store.address,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return text.includes(search);
}

export async function fullTextSearchStores(query, extraParams = {}) {
  const page = Number(extraParams.page || 0);
  const pageSize = Number(extraParams.pageSize || 12);

  const response = await getAllStores({ pageSize: Math.max(60, pageSize) });
  const allStores = response.items || [];
  const filteredStores = allStores.filter((store) => storeMatchesQuery(store, query));

  const start = page * pageSize;
  const end = start + pageSize;

  return {
    items: filteredStores.slice(start, end),
    totalItems: filteredStores.length,
    totalPages: Math.max(1, Math.ceil(filteredStores.length / pageSize)),
    page,
  };
}

export async function getAllStores(params = {}) {
  const page = await safePostStorePage("/api/client/stores/all-stores", {
    pageSize: 50,
    ...params,
  });

  return page;
}

export async function countStores(params = {}) {
  const body = buildSearchQuery(params);

  return cachedStoreRequest("count", body, async () => {
    const response = await http.post("/api/client/stores/count", body);
    return typeof response === "number" ? response : response?.count ?? 0;
  });
}

export async function getStoreDetails(storeId) {
  return cachedStoreRequest("details", { storeId }, async () => {
    const response = await http.get(`/api/client/stores/details/${storeId}`);
    return mapStoreFromApi(response);
  });
}

const storeApi = {
  getTopStores,
  getHeadlineStores,
  searchStores,
  searchAllStores,
  fullTextSearchStores,
  getAllStores,
  countStores,
  getStoreDetails,
};

export default storeApi;
