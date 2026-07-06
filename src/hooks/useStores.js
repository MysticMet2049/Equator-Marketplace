/**
 * useStores.js
 * Data-fetching hooks for stores, built on top of useApiRequest.
 *
 * Exposes:
 *   useTopStores()                 — homepage "boutiques populaires"
 *   useHeadlineStores()            — homepage "boutiques mises en avant"
 *   useStores(params)              — paginated store list (StoresPage)
 *   useStoreDetails(storeId)       — single store detail (StoreDetailPage)
 *   useStoreSearch()               — manual full-text search (SearchResultsPage)
 */

import { useEffect, useState, useCallback } from "react";
import storeApi from "../api/storeApi";
import { useApiRequest } from "./useApiRequest";

// ─── Top stores (HomePage) ─────────────────────────────────────────────────────
export function useTopStores(params = {}) {
  const { data, loading, error, run } = useApiRequest(storeApi.getTopStores, {
    immediate: true,
    initialArgs: [params],
  });

  return {
    stores: data ?? [],
    loading,
    error,
    isEmpty: !loading && !error && (data?.length ?? 0) === 0,
    refetch: () => run(params),
  };
}

// ─── Headline stores (HomePage) ────────────────────────────────────────────────
export function useHeadlineStores(params = {}) {
  const { data, loading, error, run } = useApiRequest(storeApi.getHeadlineStores, {
    immediate: true,
    initialArgs: [params],
  });

  return {
    stores: data ?? [],
    loading,
    error,
    isEmpty: !loading && !error && (data?.length ?? 0) === 0,
    refetch: () => run(params),
  };
}

// ─── Paginated store list (StoresPage) ────────────────────────────────────────
/**
 * @param {{ page?: number, pageSize?: number, searchString?: string, fieldFilters?: object }} params
 */
export function useStores(params = {}) {
  const [page, setPage] = useState(params.page ?? 0);
  const depsKey = JSON.stringify({ ...params, page });

  const { data, loading, error, run } = useApiRequest(storeApi.getAllStores);

  useEffect(() => {
    run({ ...params, page }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return {
    stores: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    page,
    setPage,
    loading,
    error,
    refetch: () => run({ ...params, page }),
    isEmpty: !loading && !error && (data?.items?.length ?? 0) === 0,
  };
}

// ─── Single store detail (StoreDetailPage) ────────────────────────────────────
/**
 * @param {number|string} storeId
 */
export function useStoreDetails(storeId) {
  const { data, loading, error, run } = useApiRequest(storeApi.getStoreDetails);

  useEffect(() => {
    if (storeId) run(storeId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  return {
    store: data,
    loading,
    error,
    refetch: () => run(storeId),
    notFound: !loading && !error && !data,
  };
}

// ─── Manual full-text search (SearchResultsPage) ───────────────────────────────
export function useStoreSearch() {
  const { data, loading, error, run, reset } = useApiRequest(
    storeApi.fullTextSearchStores
  );

  const search = useCallback(
    (query, extraParams = {}) => run(query, extraParams),
    [run]
  );

  return {
    results: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    loading,
    error,
    search,
    reset,
    isEmpty: !loading && !error && (data?.items?.length ?? 0) === 0,
  };
}

export default useStores;
