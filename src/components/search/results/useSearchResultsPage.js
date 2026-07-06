import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";
import { getProductId, SEARCH_RESULTS_PER_PAGE } from "./searchUtils";

export default function useSearchResultsPage() {
  const { getProducts, addToCart } = useApi();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [sort, setSort] = useState("pertinence");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [added, setAdded] = useState({});


  const allResults = getProducts({
    query,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1] === 500 ? undefined : priceRange[1],
    minRating: minRating || undefined,
    sort,
  });

  const totalPages = Math.max(1, Math.ceil(allResults.length / SEARCH_RESULTS_PER_PAGE));
  const results = allResults.slice((page - 1) * SEARCH_RESULTS_PER_PAGE, page * SEARCH_RESULTS_PER_PAGE);

  const toggleCategory = (category) => {
    setSelectedCategories((previous) =>
      previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category]
    );
    setPage(1);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    const productId = getProductId(product);
    setAdded((previous) => ({ ...previous, [productId]: true }));
    setTimeout(() => setAdded((previous) => ({ ...previous, [productId]: false })), 1500);
  };

  return {
    query,
    sort,
    setSort,
    sortOpen,
    setSortOpen,
    selectedCategories,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    page,
    setPage,
    added,
    allResults,
    results,
    totalPages,
    toggleCategory,
    handleAddToCart,
  };
}
