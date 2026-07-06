import { describe, expect, test } from "vitest";
function getProductPrice(product = {}) { return Number(product.price ?? product.salePrice ?? product.currentPrice ?? 0); }
function filterByPrice(products = [], { minPrice, maxPrice } = {}) {
  return products.filter((product) => {
    const price = getProductPrice(product);
    if (Number.isFinite(Number(minPrice)) && minPrice !== "" && price < Number(minPrice)) return false;
    if (Number.isFinite(Number(maxPrice)) && maxPrice !== "" && price > Number(maxPrice)) return false;
    return true;
  });
}
function sortByPrice(products = [], direction = "asc") {
  return [...products].sort((a, b) => direction === "desc" ? getProductPrice(b) - getProductPrice(a) : getProductPrice(a) - getProductPrice(b));
}
function filterPromotionsOnly(products = []) {
  return products.filter((product) => {
    const discount = Number(product.discountPercent ?? product.discount ?? 0);
    const oldPrice = Number(product.oldPrice ?? product.regularPrice ?? 0);
    const price = getProductPrice(product);
    return discount > 0 || oldPrice > price;
  });
}
describe("marketplace price filters", () => {
  const products = [{ name: "A", price: 1000 }, { name: "B", price: 5000 }, { name: "C", price: 15000 }, { name: "D", price: 8000, oldPrice: 10000 }];
  test("filtre par prix minimum et maximum", () => expect(filterByPrice(products, { minPrice: 2000, maxPrice: 10000 }).map((p) => p.name)).toEqual(["B", "D"]));
  test("filtre uniquement par prix minimum", () => expect(filterByPrice(products, { minPrice: 10000 }).map((p) => p.name)).toEqual(["C"]));
  test("trie par prix croissant", () => expect(sortByPrice(products, "asc").map((p) => p.name)).toEqual(["A", "B", "D", "C"]));
  test("trie par prix décroissant", () => expect(sortByPrice(products, "desc").map((p) => p.name)).toEqual(["C", "D", "B", "A"]));
  test("filtre les produits en promotion", () => expect(filterPromotionsOnly(products).map((p) => p.name)).toEqual(["D"]));
});
