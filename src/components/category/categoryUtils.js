import { CATEGORY_RULES } from "./categoryConfig";

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasKeyword(text, keyword) {
  const normalizedText = ` ${normalizeText(text)} `;
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) return false;

  const pattern = normalizedKeyword
    .split(" ")
    .map(escapeRegExp)
    .join("\\s+");

  return new RegExp(`(^|\\s)${pattern}(?=\\s|$)`, "i").test(normalizedText);
}

function getStrongProductText(product) {
  return [
    product.name,
    product.title,
    product.designation,
    product.label,
    product.description,
    Array.isArray(product.tags) ? product.tags.join(" ") : product.tags,
  ]
    .filter(Boolean)
    .join(" ");
}

function getMetadataProductText(product) {
  return [
    product.category,
    product.categoryName,
    product.productCategory,
    product.mainCategory,
    product.subcategory,
    product.subcategoryName,
  ]
    .filter(Boolean)
    .join(" ");
}

function scoreCategory(product, category) {
  const strongText = getStrongProductText(product);
  const metadataText = getMetadataProductText(product);

  let score = 0;

  for (const keyword of category.keywords || []) {
    if (hasKeyword(strongText, keyword)) score += 4;
    if (hasKeyword(metadataText, keyword)) score += 1;
  }

  for (const keyword of category.negativeKeywords || []) {
    if (hasKeyword(strongText, keyword)) score -= 6;
    if (hasKeyword(metadataText, keyword)) score -= 2;
  }

  return score;
}

export function inferProductCategory(product) {
  const candidates = CATEGORY_RULES.filter((category) => category.slug !== "autres")
    .map((category) => ({
      category,
      score: scoreCategory(product, category),
    }))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];

  if (best && best.score > 0) {
    return best.category;
  }

  return CATEGORY_RULES.find((category) => category.slug === "autres");
}

export function enrichProduct(product) {
  const category = inferProductCategory(product);

  return {
    ...product,
    derivedCategorySlug: category.slug,
    derivedCategoryName: category.name,
    derivedCategoryDescription: category.description,
  };
}

export function getProductImage(product) {
  return (
    product.image ||
    product.imageUrl ||
    product.cover ||
    product.coverImage ||
    product.mainImage ||
    product.thumbnail ||
    product.product?.image ||
    product.product?.imageUrl ||
    null
  );
}

export function getProductPrice(product) {
  return Number(
    product.price ||
      product.amount ||
      product.salePrice ||
      product.salesPrice ||
      product.unitPrice ||
      0
  );
}

export function getProductRating(product) {
  return Number(product.rating || product.averageRating || 0);
}

export function sortProducts(products, sort) {
  const copy = [...products];

  if (sort === "price-asc") {
    return copy.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  }

  if (sort === "price-desc") {
    return copy.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  }

  if (sort === "rating") {
    return copy.sort((a, b) => getProductRating(b) - getProductRating(a));
  }

  return copy;
}

function getBestCategoryVisualProduct(products) {
  return (
    products.find((product) => getProductImage(product)) ||
    products.find((product) => product.coverAssetId || product.mainImageAssetId || product.imageAssetId || product.assetIds?.length) ||
    products[0] ||
    null
  );
}

export function buildCategories(products) {
  return CATEGORY_RULES.map((category) => {
    const categoryProducts = products.filter(
      (product) => product.derivedCategorySlug === category.slug
    );

    const visualProduct = getBestCategoryVisualProduct(categoryProducts);

    return {
      ...category,
      count: categoryProducts.length,
      image: visualProduct ? getProductImage(visualProduct) : null,
      coverAssetId:
        visualProduct?.coverAssetId ||
        visualProduct?.mainImageAssetId ||
        visualProduct?.imageAssetId ||
        visualProduct?.assetIds?.[0] ||
        null,
      sampleProductId: visualProduct?.productId || visualProduct?.id || null,
    };
  }).filter((category) => category.count > 0);
}

export function filterProductsByCategory(products, slug, priceRange, stockOnly) {
  let result = products.filter(
    (product) => product.derivedCategorySlug === slug
  );

  if (priceRange.min) {
    result = result.filter(
      (product) => getProductPrice(product) >= Number(priceRange.min)
    );
  }

  if (priceRange.max) {
    result = result.filter(
      (product) => getProductPrice(product) <= Number(priceRange.max)
    );
  }

  if (stockOnly) {
    result = result.filter((product) => {
      if (typeof product.inStock === "boolean") return product.inStock;
      if (typeof product.available === "boolean") return product.available;

      return true;
    });
  }

  return result;
}
