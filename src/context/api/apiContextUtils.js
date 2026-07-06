// Helpers de filtrage utilisés par le contexte API local.
export function filterProducts(products, filters = {}) {
  let result = [...products];

  if (filters.category) {
    result = result.filter((product) => product.category === filters.category);
  }
  if (filters.subcategory) {
    result = result.filter((product) => product.subcategory === filters.subcategory);
  }
  if (filters.storeSlug) {
    result = result.filter((product) => product.storeSlug === filters.storeSlug);
  }
  if (filters.query) {
    const query = filters.query.toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.store.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((product) => product.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((product) => product.price <= filters.maxPrice);
  }
  if (filters.minRating !== undefined) {
    result = result.filter((product) => product.rating >= filters.minRating);
  }

  return sortProducts(result, filters.sort);
}

// Trie les produits selon les critères utilisés dans l'interface.
export function sortProducts(products, sort) {
  const result = [...products];
  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
  if (sort === "recent") result.sort((a, b) => b.id - a.id);
  return result;
}

// Filtre les boutiques par catégorie.
export function filterStores(stores, filters = {}) {
  let result = [...stores];
  if (filters.category) {
    result = result.filter((store) => store.category === filters.category);
  }
  return result;
}

// Prépare les boutiques partenaires affichées sur l'accueil.
export function getPartnerStores(stores) {
  return stores.slice(0, 2).map((store) => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    image: store.image,
  }));
}
