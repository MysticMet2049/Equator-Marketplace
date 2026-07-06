import { useMemo, useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { CATEGORY_PRODUCTS_PER_PAGE, CATEGORY_RULES } from "./categoryConfig";
import {
  enrichProduct,
  filterProductsByCategory,
  sortProducts,
} from "./categoryUtils";

const PRODUCT_PARAMS = { pageSize: 100 };

export default function useCategoryDetailPage(slug) {
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [added, setAdded] = useState({});

  const { addToCart } = useCart();
  const { products: apiProducts, loading, error } = useProducts(PRODUCT_PARAMS);

  const products = useMemo(() => {
    return apiProducts.map(enrichProduct);
  }, [apiProducts]);

  const category = CATEGORY_RULES.find((item) => item.slug === slug);

  const filteredProducts = useMemo(() => {
    const result = filterProductsByCategory(
      products,
      slug,
      priceRange,
      stockOnly
    );

    return sortProducts(result, sort);
  }, [products, slug, priceRange, stockOnly, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / CATEGORY_PRODUCTS_PER_PAGE)
  );

  const visibleProducts = filteredProducts.slice(
    (page - 1) * CATEGORY_PRODUCTS_PER_PAGE,
    page * CATEGORY_PRODUCTS_PER_PAGE
  );

  const updatePriceRange = (field, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1);
  };

  const toggleStockOnly = () => {
    setStockOnly((prev) => !prev);
    setPage(1);
  };

  const changeSort = (value) => {
    setSort(value);
    setSortOpen(false);
    setPage(1);
  };

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    setStockOnly(false);
    setPage(1);
  };

  const handleAdd = async (product) => {
    await addToCart(product.productId || product.id, product.storeId, product, 1);

    setAdded((prev) => ({
      ...prev,
      [product.id]: true,
    }));

    setTimeout(() => {
      setAdded((prev) => ({
        ...prev,
        [product.id]: false,
      }));
    }, 1400);
  };

  return {
    category,
    loading,
    error,
    priceRange,
    stockOnly,
    sort,
    sortOpen,
    page,
    totalPages,
    filteredProducts,
    visibleProducts,
    added,
    setPage,
    setSortOpen,
    changeSort,
    updatePriceRange,
    toggleStockOnly,
    clearFilters,
    handleAdd,
  };
}
