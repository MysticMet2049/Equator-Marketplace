import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addProductToFavorites,
  getFavoriteProducts,
  removeProductFromFavorites,
} from "../../api/favoriteApi";
import { useAuth } from "../AuthContext";
import {
  ROLLBACK_ON_ERROR,
  dispatchFavoritesChanged,
  extractIsFavorite,
  getProductId,
  normalizeFavoriteSnapshot,
} from "./favoritesUtils";

// Hook métier du contexte favoris : chargement, mutation optimiste et rollback.
export function useFavoritesProviderValue() {
  const { isAuthenticated } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoriteOverrides, setFavoriteOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingProductIds, setPendingProductIds] = useState([]);

  const favoriteProductIds = useMemo(() => {
    const ids = new Set();
    favoriteProducts.forEach((product) => {
      const productId = getProductId(product);
      if (productId) ids.add(productId);
    });
    Object.entries(favoriteOverrides).forEach(([productId, favorite]) => {
      if (favorite) ids.add(String(productId));
      else ids.delete(String(productId));
    });
    return ids;
  }, [favoriteProducts, favoriteOverrides]);

  const isProductFavorite = useCallback((productOrId) => {
    const productId = getProductId(productOrId);
    if (!productId) return false;
    if (Object.prototype.hasOwnProperty.call(favoriteOverrides, productId)) {
      return Boolean(favoriteOverrides[productId]);
    }
    return favoriteProductIds.has(productId) || extractIsFavorite(productOrId);
  }, [favoriteProductIds, favoriteOverrides]);

  const isProductFavoritePending = useCallback((productOrId) => {
    const productId = getProductId(productOrId);
    return Boolean(productId && pendingProductIds.includes(productId));
  }, [pendingProductIds]);

  const replaceFavoriteProducts = useCallback((nextProducts) => {
    setFavoriteProducts(nextProducts);
    dispatchFavoritesChanged({ products: nextProducts });
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      replaceFavoriteProducts([]);
      setFavoriteOverrides({});
      setError(null);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getFavoriteProducts({ pageSize: 100 });
      const items = response.items || [];
      replaceFavoriteProducts(items);
      setFavoriteOverrides({});
      return items;
    } catch (err) {
      console.error("[FavoritesContext] Impossible de charger les favoris :", err);
      replaceFavoriteProducts([]);
      setError(err.message || "Impossible de charger les favoris.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, replaceFavoriteProducts]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const markPending = useCallback((productId, pending) => {
    setPendingProductIds((previous) => {
      if (pending) return previous.includes(productId) ? previous : [...previous, productId];
      return previous.filter((id) => id !== productId);
    });
  }, []);

  const applyLocalFavorite = useCallback((productOrId, favorite) => {
    const productId = getProductId(productOrId);
    if (!productId) return [];

    setFavoriteOverrides((previous) => ({ ...previous, [productId]: Boolean(favorite) }));

    let nextProducts = [];
    setFavoriteProducts((previous) => {
      if (favorite) {
        const exists = previous.some((product) => getProductId(product) === productId);
        nextProducts = exists
          ? previous.map((product) =>
              getProductId(product) === productId
                ? normalizeFavoriteSnapshot({ ...product, ...productOrId }, productId)
                : product
            )
          : [normalizeFavoriteSnapshot(productOrId, productId), ...previous];
      } else {
        nextProducts = previous.filter((product) => getProductId(product) !== productId);
      }
      dispatchFavoritesChanged({ productId, favorite, products: nextProducts });
      return nextProducts;
    });
    return nextProducts;
  }, []);

  const runFavoriteAction = useCallback(async (productOrId, shouldBeFavorite) => {
    const productId = getProductId(productOrId);
    if (!productId) throw new Error("Identifiant du produit introuvable.");

    const wasFavorite = isProductFavorite(productOrId);
    setError(null);
    markPending(productId, true);
    applyLocalFavorite(productOrId, shouldBeFavorite);

    try {
      if (shouldBeFavorite) await addProductToFavorites(productOrId);
      else await removeProductFromFavorites(productOrId);
      return await refreshFavorites();
    } catch (err) {
      const isLocalOnly = Number(err?.status) === 501 && err?.data?.localOnly;

      if (isLocalOnly) {
        // Le Swagger actuel n'expose pas la mutation favoris. On garde donc l'état local
        // sans afficher d'erreur rouge ni faire de rollback.
        console.warn("[FavoritesContext] Favori conservé localement : endpoint backend non configuré.");
        setError(null);
        return [];
      }

      console.error("[FavoritesContext] Mutation favori impossible :", err);
      setError("Impossible de mettre à jour les favoris pour le moment.");
      if (ROLLBACK_ON_ERROR) applyLocalFavorite(productOrId, wasFavorite);
      throw err;
    } finally {
      markPending(productId, false);
    }
  }, [applyLocalFavorite, isProductFavorite, markPending, refreshFavorites]);

  const addFavorite = useCallback((productOrId) => runFavoriteAction(productOrId, true), [runFavoriteAction]);
  const removeFavorite = useCallback((productOrId) => runFavoriteAction(productOrId, false), [runFavoriteAction]);
  const toggleFavorite = useCallback((productOrId) => runFavoriteAction(productOrId, !isProductFavorite(productOrId)), [isProductFavorite, runFavoriteAction]);

  return useMemo(() => ({
    favoriteProducts,
    favoriteProductIds,
    favoriteCount: favoriteProducts.length,
    loading,
    error,
    refreshFavorites,
    isProductFavorite,
    isProductFavoritePending,
    applyLocalFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    setError,
  }), [favoriteProducts, favoriteProductIds, loading, error, refreshFavorites, isProductFavorite, isProductFavoritePending, applyLocalFavorite, addFavorite, removeFavorite, toggleFavorite]);
}
