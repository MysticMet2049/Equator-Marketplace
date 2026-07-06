import { describe, expect, test } from "vitest";

const CATEGORY_RULES = {
  "Électronique": {
    include: ["iphone", "samsung", "smartphone", "telephone", "téléphone", "laptop", "ordinateur", "pc", "hp", "dell", "lenovo", "asus", "acer", "macbook", "chargeur", "bluetooth", "ssd", "hdd", "disque", "camera", "caméra", "ecouteur", "écouteur", "casque", "ps5", "playstation", "tablette"],
    exclude: ["poêle", "poele", "casserole", "bassine", "biscuit", "biscuits", "coquillettes", "parfum", "lait corps", "shampoing", "douche", "couche", "oignon", "maïs", "mais"],
  },
  "Mode": {
    include: ["montre", "chaussure", "robe", "chemise", "pantalon", "t-shirt", "tshirt", "valise", "sac à main", "sac main", "bijou", "lunette", "casquette", "vêtement", "vetement"],
    exclude: ["sachet", "biscuit", "biscuits", "coquillettes", "poêle", "poele", "casserole", "bassine", "lait corps", "shampoing", "douche", "iphone", "samsung", "ordinateur", "laptop"],
  },
  "Maison & Jardin": {
    include: ["poêle", "poele", "casserole", "bassine", "bouilloire", "marmite", "assiette", "verre", "jardin", "cisaille", "panneau", "seau", "cobal", "ustensile", "ménage", "menage"],
    exclude: ["iphone", "samsung", "smartphone", "ordinateur", "laptop", "parfum", "dior", "ysl", "lancome", "biscuit", "biscuits", "coquillettes", "lait corps"],
  },
  "Beauté": {
    include: ["parfum", "dior", "ysl", "lancome", "acqua", "glossy", "lait corps", "shampoing", "gel douche", "crème", "creme", "maquillage", "teint", "beauté", "beaute"],
    exclude: ["biscuit", "biscuits", "coquillettes", "iphone", "samsung", "ordinateur", "poêle", "poele", "bassine", "casserole"],
  },
};

function normalizeText(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function getProductText(product = {}) {
  return normalizeText([product.name, product.title, product.description, product.category, product.categoryName, product.subCategory, product.storeName].filter(Boolean).join(" "));
}
function matchesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}
function matchesCategory(product, category) {
  if (!category || category === "Tout") return true;
  const rules = CATEGORY_RULES[category];
  if (!rules) return true;
  const text = getProductText(product);
  if (matchesAny(text, rules.exclude)) return false;
  return matchesAny(text, rules.include);
}

describe("marketplace strict category filters", () => {
  test("Électronique accepte un téléphone", () => {
    expect(matchesCategory({ name: "iPhone 13 Pro Max" }, "Électronique")).toBe(true);
  });
  test("Électronique accepte un ordinateur", () => {
    expect(matchesCategory({ name: "Laptop HP EliteBook i7 SSD" }, "Électronique")).toBe(true);
  });
  test("Électronique refuse une poêle", () => {
    expect(matchesCategory({ name: "Poêle COBAL Grand Format" }, "Électronique")).toBe(false);
  });
  test("Électronique refuse un biscuit", () => {
    expect(matchesCategory({ name: "Biscuits en sachet 700g" }, "Électronique")).toBe(false);
  });
  test("Mode accepte une montre", () => {
    expect(matchesCategory({ name: "Montre Emporio noire or" }, "Mode")).toBe(true);
  });
  test("Mode accepte une valise", () => {
    expect(matchesCategory({ name: "Valise rigide rose" }, "Mode")).toBe(true);
  });
  test("Mode refuse les biscuits en sachet", () => {
    expect(matchesCategory({ name: "Biscuits en sachet 700g" }, "Mode")).toBe(false);
  });
  test("Maison & Jardin accepte une bassine", () => {
    expect(matchesCategory({ name: "Bassine petit format" }, "Maison & Jardin")).toBe(true);
  });
  test("Maison & Jardin refuse un smartphone", () => {
    expect(matchesCategory({ name: "Samsung Galaxy S23" }, "Maison & Jardin")).toBe(false);
  });
  test("Beauté accepte un parfum", () => {
    expect(matchesCategory({ name: "DIOR FAHRENHEIT EDT 50ML VAPO" }, "Beauté")).toBe(true);
  });
});
