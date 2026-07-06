import { useMemo } from "react";
import { useProducts } from "../../hooks/useProducts";
import { buildCategories, enrichProduct } from "./categoryUtils";

const PRODUCT_PARAMS = { pageSize: 100 };

export default function useCategoryListing() {
  const { products: apiProducts, loading, error } = useProducts(PRODUCT_PARAMS);

  const products = useMemo(() => {
    return apiProducts.map(enrichProduct);
  }, [apiProducts]);

  const categories = useMemo(() => {
    return buildCategories(products);
  }, [products]);

  return {
    categories,
    loading,
    error,
  };
}
