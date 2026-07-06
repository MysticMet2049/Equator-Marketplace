const CATEGORY_KEYWORDS = {
  "maison & jardin": [
    "maison",
    "jardin",
    "mobilier",
    "meuble",
    "table",
    "chaise",
    "fauteuil",
    "canape",
    "decoration",
    "bureau",
    "lampe",
    "cuisine",
    "poele",
    "poele coban",
    "poele cobal",
    "casserole",
    "marmite",
    "bouilloire",
    "electric kettle",
    "kettle",
    "bassine",
    "cisaille",
    "panneau",
    "signalisation",
    "outil",
    "bricolage",
    "fertimax",
    "engrais",
    "semence",
    "oignon",
    "mais dekalb",
    "dekalb",
    "tako",
    "lambdamax",
    "insecticide",
    "herbicide",
  ],
  "électronique": [
    "electronique",
    "smartphone",
    "telephone",
    "iphone",
    "samsung",
    "galaxy",
    "google pixel",
    "pixel",
    "ipad",
    "tablet",
    "tablette",
    "ordinateur",
    "pc",
    "laptop",
    "macbook",
    "surface",
    "thinkpad",
    "elitebook",
    "latitude",
    "legion",
    "zbook",
    "lenovo",
    "dell",
    "asus",
    "acer",
    "hp",
    "casque",
    "headphone",
    "ecouteur",
    "earbuds",
    "airpods",
    "jbl",
    "oraimo",
    "chargeur",
    "charger",
    "cable usb",
    "usb",
    "bluetooth",
    "camera",
    "tv",
    "television",
    "ecran",
    "console",
    "playstation",
    "ps5",
    "ssd",
    "hdd",
    "disque dur",
    "power bank",
  ],
  mode: [
    "mode",
    "vetement",
    "robe",
    "chemise",
    "pantalon",
    "jean",
    "tshirt",
    "t-shirt",
    "chaussure",
    "sandale",
    "sac a main",
    "maroquinerie",
    "valise",
    "montre",
    "emporio",
    "bijou",
    "ceinture",
    "casquette",
    "lunette",
  ],
  beauté: [
    "beaute",
    "parfum",
    "perfume",
    "edp",
    "edt",
    "dior",
    "ysl",
    "cartier",
    "lancome",
    "boss",
    "acqua",
    "fahrenheit",
    "zara wonder",
    "gel douche",
    "douche",
    "cadum",
    "diadermine",
    "creme",
    "lait corps",
    "yves rocher",
    "glossy",
    "plumping",
    "soin",
    "maquillage",
  ],
};

const CATEGORY_EXCLUSIONS = {
  "électronique": [
    "poele",
    "casserole",
    "marmite",
    "bouilloire",
    "kettle",
    "bassine",
    "cisaille",
    "panneau",
    "fertimax",
    "engrais",
    "semence",
    "oignon",
    "mais dekalb",
    "dekalb",
    "tako",
    "lambdamax",
    "parfum",
    "dior",
    "ysl",
    "lancome",
    "glossy",
    "biscuits",
    "biscuit",
    "sachet",
    "coquillettes",
    "couche",
    "gel douche",
  ],
  mode: [
    "biscuits",
    "biscuit",
    "sachet",
    "coquillettes",
    "cadum",
    "gel douche",
    "parfum",
    "edp",
    "edt",
    "dior",
    "ysl",
    "lancome",
    "poele",
    "casserole",
    "bouilloire",
    "bassine",
    "fertimax",
    "engrais",
    "oignon",
    "dekalb",
    "lambdamax",
    "tako",
  ],
  "maison & jardin": [
    "biscuits",
    "biscuit",
    "coquillettes",
    "parfum",
    "edp",
    "edt",
    "dior",
    "ysl",
    "lancome",
    "glossy",
    "iphone",
    "samsung",
    "ordinateur",
    "laptop",
    "macbook",
    "ssd",
    "ps5",
  ],
  beauté: [
    "biscuits",
    "coquillettes",
    "poele",
    "casserole",
    "bouilloire",
    "bassine",
    "iphone",
    "ordinateur",
    "fertimax",
    "engrais",
    "semence",
  ],
};

const FOOD_WORDS = [
  "biscuit",
  "biscuits",
  "coquillettes",
  "pates",
  "pate",
  "riz",
  "sucre",
  "lait",
  "boisson",
  "huile",
  "farine",
  "sachet 700g",
  "500g",
  "700g",
];

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenize(value) {
  return normalizeText(value).match(/[a-z0-9]+/g) || [];
}

function getNestedProduct(product = {}) {
  const raw = product._raw || {};

  return (
    raw.productPromoSummaryDto ||
    raw.productPromoHeaderSummaryDto ||
    raw.clientCatalogProductSummaryDto ||
    raw.catalogProductSummaryDto ||
    raw.productHeaderSummaryDto ||
    raw.productSummaryDto ||
    raw.product ||
    raw.catalogProduct ||
    {}
  );
}

function pushStringValue(values, value) {
  if (!value) return;

  if (typeof value === "string" || typeof value === "number") {
    values.push(value);
    return;
  }

  if (typeof value === "object") {
    values.push(
      value.name,
      value.label,
      value.title,
      value.categoryName,
      value.description,
      value.slug,
      value.code
    );
  }
}

function collectCategoryValues(product = {}) {
  const raw = product._raw || {};
  const nested = getNestedProduct(product);
  const values = [];

  [
    product.category,
    product.categoryName,
    product.productCategory,
    product.department,
    product.subcategory,
    raw.category,
    raw.categoryName,
    raw.productCategory,
    raw.department,
    raw.subcategory,
    nested.category,
    nested.categoryName,
    nested.productCategory,
    nested.department,
    nested.subcategory,
    nested.categorySummaryDto,
    raw.categorySummaryDto,
  ].forEach((value) => pushStringValue(values, value));

  [
    product.categories,
    raw.categories,
    nested.categories,
    product.categoryNames,
    raw.categoryNames,
    nested.categoryNames,
  ].forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => pushStringValue(values, item));
  });

  return values.filter(Boolean).map(normalizeText);
}

function getProductIdentityText(product = {}) {
  const raw = product._raw || {};
  const nested = getNestedProduct(product);

  return normalizeText(
    [
      product.name,
      product.title,
      product.description,
      product.storeName,
      product.brand,
      product.model,
      raw.name,
      raw.title,
      raw.designation,
      raw.description,
      raw.brand,
      raw.model,
      nested.name,
      nested.title,
      nested.designation,
      nested.description,
      nested.brand,
      nested.model,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getProductSearchText(product = {}) {
  return normalizeText([getProductIdentityText(product), ...collectCategoryValues(product)].join(" "));
}

function getCategoryAliases(category) {
  const normalized = normalizeText(category);

  if (["all", "tout", ""].includes(normalized)) return [];
  if (normalized.includes("maison") || normalized.includes("jardin")) return ["maison & jardin"];
  if (normalized.includes("electron") || normalized.includes("electro")) return ["électronique"];
  if (normalized.includes("mode")) return ["mode"];
  if (normalized.includes("beaute")) return ["beauté"];

  return [normalized];
}

function phraseMatchesText(text, tokens, phrase) {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return false;

  const phraseTokens = tokenize(normalizedPhrase);
  if (phraseTokens.length === 0) return false;

  if (phraseTokens.length === 1) {
    return tokens.includes(phraseTokens[0]);
  }

  return text.includes(normalizedPhrase);
}

function countKeywordMatches(text, keywords = []) {
  const tokens = tokenize(text);
  return keywords.reduce((score, keyword) => (phraseMatchesText(text, tokens, keyword) ? score + 1 : score), 0);
}

function categoryExplicitlyMatches(productCategories, alias) {
  const normalizedAlias = normalizeText(alias);
  const aliasTokens = tokenize(normalizedAlias);

  return productCategories.some((categoryValue) => {
    if (categoryValue === normalizedAlias) return true;
    const categoryTokens = tokenize(categoryValue);

    return aliasTokens.some((token) => categoryTokens.includes(token));
  });
}

function isClearlyFood(text) {
  return countKeywordMatches(text, FOOD_WORDS) > 0;
}

export function productMatchesMarketplaceCategory(product, category) {
  const aliases = getCategoryAliases(category);
  if (aliases.length === 0) return true;

  const productCategories = collectCategoryValues(product);
  const identityText = getProductIdentityText(product);
  const fullText = getProductSearchText(product);

  return aliases.some((alias) => {
    const keywords = CATEGORY_KEYWORDS[alias] || [alias];
    const exclusions = CATEGORY_EXCLUSIONS[alias] || [];
    const explicitCategoryMatch = categoryExplicitlyMatches(productCategories, alias);
    const matchScore = countKeywordMatches(fullText, keywords);
    const exclusionScore = countKeywordMatches(identityText, exclusions);

    // Les aliments ne doivent pas apparaître dans Mode, Électronique, Beauté ou Maison par simple mot parasite.
    if (["mode", "électronique", "beauté", "maison & jardin"].includes(alias) && isClearlyFood(identityText)) {
      return false;
    }

    // Si le nom du produit contient clairement une autre famille, on évite le mélange.
    if (exclusionScore > 0 && !explicitCategoryMatch) return false;
    if (exclusionScore > 0 && matchScore <= exclusionScore) return false;

    if (explicitCategoryMatch && matchScore > 0) return true;
    if (explicitCategoryMatch && exclusionScore === 0) return true;

    return matchScore > 0;
  });
}

export function getProductPrice(product = {}) {
  const raw = product._raw || {};
  const nested = getNestedProduct(product);

  const price = Number(
    firstDefined(
      product.price,
      product.salesPrice,
      product.salePrice,
      product.amount,
      product.unitPrice,
      product.minimumSalePrice,
      product.newPrice,
      product.promoPrice,
      raw.price,
      raw.salesPrice,
      raw.salePrice,
      raw.amount,
      raw.unitPrice,
      raw.minimumSalePrice,
      raw.newPrice,
      raw.promoPrice,
      nested.price,
      nested.salesPrice,
      nested.salePrice,
      nested.minimumSalePrice,
      nested.newPrice,
      nested.promoPrice,
      0
    )
  );

  return Number.isFinite(price) ? price : 0;
}

export function getProductRating(product = {}) {
  const raw = product._raw || {};
  const nested = getNestedProduct(product);

  const rating = Number(
    firstDefined(
      product.rating,
      product.averageRating,
      product.note,
      raw.rating,
      raw.averageRating,
      raw.note,
      nested.rating,
      nested.averageRating,
      nested.note,
      0
    )
  );

  return Number.isFinite(rating) ? rating : 0;
}

export function productHasDiscount(product = {}) {
  const price = getProductPrice(product);
  const raw = product._raw || {};
  const nested = getNestedProduct(product);
  const oldPrice = Number(
    firstDefined(
      product.oldPrice,
      product.originalPrice,
      product.listPrice,
      raw.oldPrice,
      raw.originalPrice,
      raw.listPrice,
      nested.oldPrice,
      nested.originalPrice,
      nested.listPrice,
      0
    )
  );
  const discount = Number(
    firstDefined(
      product.discountPercentage,
      product.discountRate,
      raw.discountPercentage,
      raw.discountRate,
      nested.discountPercentage,
      nested.discountRate,
      0
    )
  );

  return discount > 0 || (oldPrice > 0 && price > 0 && price < oldPrice);
}

export function applyMarketplaceFilters(products = [], filters = {}) {
  const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  const minRating = Number(filters.minRating || 0);

  const filtered = products.filter((product) => {
    const price = getProductPrice(product);
    const rating = getProductRating(product);

    if (!productMatchesMarketplaceCategory(product, filters.category)) return false;
    if (Number.isFinite(minPrice) && price < minPrice) return false;
    if (Number.isFinite(maxPrice) && price > maxPrice) return false;
    if (Number.isFinite(minRating) && minRating > 0 && rating < minRating) return false;
    if (filters.onlyDiscounted && !productHasDiscount(product)) return false;

    return true;
  });

  if (filters.sortBy === "price-asc") {
    return [...filtered].sort((a, b) => getProductPrice(a) - getProductPrice(b));
  }

  if (filters.sortBy === "price-desc") {
    return [...filtered].sort((a, b) => getProductPrice(b) - getProductPrice(a));
  }

  if (filters.sortBy === "rating") {
    return [...filtered].sort((a, b) => getProductRating(b) - getProductRating(a));
  }

  if (filters.sortBy === "discount") {
    return [...filtered].sort(
      (a, b) => Number(b.discountPercentage || 0) - Number(a.discountPercentage || 0)
    );
  }

  return filtered;
}

export function paginateMarketplaceProducts(products = [], page = 0, pageSize = 30) {
  const safePage = Math.max(0, Number(page) || 0);
  const safePageSize = Math.max(1, Number(pageSize) || 30);
  const start = safePage * safePageSize;

  return products.slice(start, start + safePageSize);
}
