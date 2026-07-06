export function filterProductsByCategory(products = [], category) {
  if (!category || category === "all") return products;

  return products.filter((product) => {
    const productCategory = product?.category || product?.categoryName || "";
    return productCategory.toLowerCase() === category.toLowerCase();
  });
}

export function filterProductsBySearch(products = [], search = "") {
  const query = search.trim().toLowerCase();
  if (!query) return products;

  return products.filter((product) => {
    const name = product?.name || product?.title || "";
    const store = product?.store || product?.storeName || "";
    const description = product?.description || "";

    return `${name} ${store} ${description}`.toLowerCase().includes(query);
  });
}

export function sortProducts(products = [], sort = "default") {
  const sorted = [...products];

  if (sort === "price-asc") return sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (sort === "price-desc") return sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  if (sort === "rating") return sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

  return sorted;
}
