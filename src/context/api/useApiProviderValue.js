import { useCallback, useMemo, useState } from "react";
import { CATEGORIES } from "../../data/categories";
import { HERO_SLIDES } from "../../data/heroSlides";
import { ALL_PRODUCTS } from "../../data/products";
import { ALL_STORES } from "../../data/stores";
import { filterProducts, filterStores, getPartnerStores } from "./apiContextUtils";

// Hook qui conserve les données mockées et les helpers historiques du projet.
export function useApiProviderValue() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );

  const addToCart = useCallback((product, qty = 1) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      if (existing) {
        return previous.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...previous, { ...product, qty }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }, []);

  const isInWishlist = useCallback((id) => wishlist.includes(id), [wishlist]);
  const getProducts = useCallback((filters = {}) => filterProducts(ALL_PRODUCTS, filters), []);
  const getProductById = useCallback((id) => ALL_PRODUCTS.find((product) => product.id === parseInt(id)), []);
  const getStores = useCallback((filters = {}) => filterStores(ALL_STORES, filters), []);
  const getStoreBySlug = useCallback((slug) => ALL_STORES.find((store) => store.slug === slug), []);
  const getCategoryBySlug = useCallback((slug) => CATEGORIES.find((category) => category.slug === slug), []);

  const getSimilarProducts = useCallback(
    (product, limit = 4) =>
      ALL_PRODUCTS.filter(
        (candidate) => candidate.id !== product.id && candidate.category === product.category
      ).slice(0, limit),
    []
  );

  return useMemo(() => ({
    heroSlides: HERO_SLIDES,
    categories: CATEGORIES,
    allStores: ALL_STORES,
    featuredProducts: ALL_PRODUCTS.slice(0, 4),
    partnerStores: getPartnerStores(ALL_STORES),
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
    wishlist,
    toggleWishlist,
    isInWishlist,
    searchQuery,
    setSearchQuery,
    getProducts,
    getProductById,
    getSimilarProducts,
    getStores,
    getStoreBySlug,
    getCategoryBySlug,
  }), [cart, cartCount, cartTotal, addToCart, removeFromCart, clearCart, wishlist, toggleWishlist, isInWishlist, searchQuery, getProducts, getProductById, getSimilarProducts, getStores, getStoreBySlug, getCategoryBySlug]);
}
