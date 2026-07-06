import { describe, expect, test } from "vitest";
function getProductRating(product = {}) { return Number(product.rating ?? product.averageRating ?? product.rate ?? 0); }
function filterByRating(products = [], minRating = 0) { return products.filter((product) => getProductRating(product) >= Number(minRating)); }
function sortByRating(products = []) { return [...products].sort((a, b) => getProductRating(b) - getProductRating(a)); }
describe("marketplace rating filters", () => {
  const products = [{ name: "Produit A", rating: 4.5 }, { name: "Produit B", rating: 3 }, { name: "Produit C", rating: 0 }, { name: "Produit D", averageRating: 5 }];
  test("garde seulement les produits avec une note supérieure ou égale à 4", () => expect(filterByRating(products, 4).map((p) => p.name)).toEqual(["Produit A", "Produit D"]));
  test("exclut les produits sans note si minRating vaut 1", () => expect(filterByRating(products, 1).map((p) => p.name)).toEqual(["Produit A", "Produit B", "Produit D"]));
  test("trie les produits par meilleure note", () => expect(sortByRating(products).map((p) => p.name)).toEqual(["Produit D", "Produit A", "Produit B", "Produit C"]));
});
