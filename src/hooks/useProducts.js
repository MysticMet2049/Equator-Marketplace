/**
 * useProducts.js
 * Data-fetching hooks for the product catalog, built on top of
 * useApiRequest so every consumer gets loading/error/data for free.
 *
 * Exposes:
 *   useProducts(params)            — paginated product search (MarketplacePage)
 *   useProductDetails(productId)   — single product detail (ProductPage)
 *   useStoreProducts(storeId)      — products for a given store (StoreDetailPage)
 *   useSimilarProducts(criteria)   — "produits similaires" section
 *   useProductSearch()             — manual full-text search trigger (SearchResultsPage)
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import productApi from "../api/productApi";
import { useApiRequest } from "./useApiRequest";

// ─── Paginated product list (Marketplace) ─────────────────────────────────────
/**
 * @param {{ page?: number, pageSize?: number, searchString?: string, sortBy?: string, sortDirection?: string, fieldFilters?: object }} params
 * @returns {{ products: object[], totalItems: number, totalPages: number, page: number, loading: boolean, error: string|null, refetch: Function, isEmpty: boolean }}
 */
export function useProducts(params = {}) {
  const [page, setPage] = useState(params.page ?? 0);

  // Stable dependency key so we don't refetch on every render when caller
  // passes a fresh object literal with the same content.
  const depsKey = JSON.stringify({ ...params, page });

  const { data, loading, error, run } = useApiRequest(productApi.searchProducts);

  useEffect(() => {
    run({ ...params, page }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return {
    products: data?.items ?? [],
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

// ─── Single product detail (ProductPage) ──────────────────────────────────────
/**
 * @param {number|string} productId
 */
export function useProductDetails(productId) {
  const { data, loading, error, run } = useApiRequest(productApi.getProductDetails);

  useEffect(() => {
    if (productId) run(productId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return {
    product: data,
    loading,
    error,
    refetch: () => run(productId),
    notFound: !loading && !error && !data,
  };
}

// ─── Products of a given store (StoreDetailPage) ──────────────────────────────
/**
 * @param {number|string} storeId
 * @param {object} params
 */
export function useStoreProducts(storeId, params = {}) {
  const depsKey = JSON.stringify({ storeId, ...params });
  const { data, loading, error, run } = useApiRequest(productApi.getProductsByStore);

  useEffect(() => {
    if (storeId) run(storeId, params).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return {
    products: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    loading,
    error,
    refetch: () => run(storeId, params),
    isEmpty: !loading && !error && (data?.items?.length ?? 0) === 0,
  };
}

// ─── Similar products ("produits similaires") ─────────────────────────────────
/**
 * @param {{ productId?: number, categoryIds?: number[] }} criteria
 */
export function useSimilarProducts(criteria = {}) {
  const depsKey = JSON.stringify(criteria);
  const { data, loading, error, run } = useApiRequest(productApi.getSimilarProducts);

  useEffect(() => {
    if (criteria.productId || criteria.categoryIds?.length) {
      run(criteria).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return {
    products: data ?? [],
    loading,
    error,
    isEmpty: !loading && !error && (data?.length ?? 0) === 0,
  };
}

// ─── Manual full-text search (SearchResultsPage) ───────────────────────────────
/**
 * Unlike the hooks above, this one does NOT auto-run on mount — the caller
 * triggers `search(query)` explicitly (e.g. on submit or query-param change).
 */
export function useProductSearch() {
  const { data, loading, error, run, reset } = useApiRequest(
    productApi.fullTextSearchProducts
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

export default useProducts;
