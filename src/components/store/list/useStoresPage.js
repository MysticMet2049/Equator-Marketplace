import { useEffect, useMemo, useState } from "react";
import productApi from "../../../api/productApi";
import { useStores } from "../../../hooks/useStores";
import { STORES_PER_PAGE } from "./storeListConfig";
import { enrichStore, getStoreId } from "./storeListUtils";

// Les stores s'affichent immédiatement.
// Les compteurs produits sont récupérés en une seule passe, pas avec 2 requêtes par store.
export default function useStoresPage() {
  const [page, setPage] = useState(1);
  const [productMetrics, setProductMetrics] = useState(new Map());
  const [metricsReady, setMetricsReady] = useState(false);

  const storeParams = useMemo(() => ({ pageSize: 60 }), []);
  const { stores: apiStores, loading, error, isEmpty } = useStores(storeParams);

  const storeIds = useMemo(
    () => (apiStores || []).map(getStoreId).filter(Boolean).map(String),
    [apiStores]
  );

  const storeIdsKey = storeIds.join("|");

  useEffect(() => {
    if (storeIds.length === 0) {
      setMetricsReady(true);
      return undefined;
    }

    let cancelled = false;

    async function loadProductCounts() {
      setMetricsReady(false);

      try {
        const counts = await productApi.getProductCountsByStore({ pageSize: 500 });
        if (!cancelled) setProductMetrics(counts);
      } catch (err) {
        if (!cancelled) {
          console.warn("[StoresPage] Compteurs produits indisponibles:", err);
          setProductMetrics(new Map());
        }
      } finally {
        if (!cancelled) setMetricsReady(true);
      }
    }

    loadProductCounts();

    return () => {
      cancelled = true;
    };
  }, [storeIdsKey]);

  const storesList = useMemo(
    () =>
      (apiStores || []).map((store) =>
        enrichStore(store, productMetrics, { metricsReady })
      ),
    [apiStores, productMetrics, metricsReady]
  );

  const totalPages = Math.max(1, Math.ceil(storesList.length / STORES_PER_PAGE));

  const stores = useMemo(() => {
    const start = (page - 1) * STORES_PER_PAGE;
    const end = start + STORES_PER_PAGE;
    return storesList.slice(start, end);
  }, [storesList, page]);

  return {
    page,
    setPage,
    stores,
    filteredStores: storesList,
    totalPages,
    loading,
    error,
    isEmpty,
  };
}
