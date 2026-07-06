import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import {
  applyMarketplaceFilters,
  getProductPrice,
  paginateMarketplaceProducts,
} from "../../../utils/marketplaceFilters";
import { getProductId, SEARCH_RESULTS_PER_PAGE } from "./searchUtils";

const SEARCH_FILTER_POOL_SIZE = 1000;

export default function useSearchResultsPage() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const cleanQuery = query.trim();

  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [page, setPage] = useState(1);
  const [added, setAdded] = useState({});

  const productParams = useMemo(
    () => ({
      pageSize: SEARCH_FILTER_POOL_SIZE,
      readAll: true,
      searchString: cleanQuery,
    }),
    [cleanQuery]
  );

  const { products, loading, error } = useProducts(productParams);

  const maxAvailablePrice = useMemo(() => {
    const max = products.reduce((highest, product) => Math.max(highest, getProductPrice(product)), 0);
    return Math.max(1000, Math.ceil(max / 1000) * 1000);
  }, [products]);

  const hasActiveFilters = Boolean(
    minPrice.trim() ||
      maxPrice.trim() ||
      minRating > 0 ||
      onlyDiscounted ||
      sortBy !== "default"
  );

  useEffect(() => {
    setPage(1);
  }, [cleanQuery, minPrice, maxPrice, minRating, onlyDiscounted, sortBy]);

  const allResults = useMemo(
    () =>
      applyMarketplaceFilters(products, {
        category: "all",
        minPrice,
        maxPrice,
        minRating,
        onlyDiscounted,
        sortBy,
      }),
    [products, minPrice, maxPrice, minRating, onlyDiscounted, sortBy]
  );

  const totalPages = Math.max(1, Math.ceil(allResults.length / SEARCH_RESULTS_PER_PAGE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const results = paginateMarketplaceProducts(allResults, safePage - 1, SEARCH_RESULTS_PER_PAGE);

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setOnlyDiscounted(false);
    setSortBy("default");
  };

  const handleAddToCart = async (product) => {
    const productId = getProductId(product);

    try {
      await addToCart(product, 1);
      setAdded((previous) => ({ ...previous, [productId]: true }));
      setTimeout(() => setAdded((previous) => ({ ...previous, [productId]: false })), 1500);
    } catch (error) {
      console.warn("[SearchResults] Ajout au panier impossible :", error);
    }
  };

  return {
    query: cleanQuery,
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minRating,
    setMinRating,
    onlyDiscounted,
    setOnlyDiscounted,
    maxAvailablePrice,
    hasActiveFilters,
    resetFilters,
    page: safePage,
    setPage,
    added,
    allResults,
    results,
    totalPages,
    loading,
    error,
    handleAddToCart,
  };
}
