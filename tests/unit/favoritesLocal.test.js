import { describe, expect, test } from "vitest";
function getFavoriteKey(item = {}) { const refId = item.productId ?? item.storeId ?? item.refId ?? item.id; const refType = item.refType ?? (item.productId ? "PRODUCT" : "STORE"); return `${refType}:${refId}`; }
function toggleFavorite(favorites = [], item = {}) { const key = getFavoriteKey(item); const exists = favorites.some((favorite) => getFavoriteKey(favorite) === key); return exists ? favorites.filter((favorite) => getFavoriteKey(favorite) !== key) : [...favorites, item]; }
function isFavorite(favorites = [], item = {}) { const key = getFavoriteKey(item); return favorites.some((favorite) => getFavoriteKey(favorite) === key); }
describe("favorites local logic", () => {
  test("ajoute un produit aux favoris", () => { const result = toggleFavorite([], { productId: 12, name: "iPhone", refType: "PRODUCT" }); expect(result).toHaveLength(1); expect(result[0].productId).toBe(12); });
  test("retire un produit déjà favori", () => expect(toggleFavorite([{ productId: 12, refType: "PRODUCT" }], { productId: 12, refType: "PRODUCT" })).toEqual([]));
  test("ne retire pas les autres favoris", () => expect(toggleFavorite([{ productId: 10, refType: "PRODUCT" }, { productId: 12, refType: "PRODUCT" }, { productId: 15, refType: "PRODUCT" }], { productId: 12, refType: "PRODUCT" }).map((item) => item.productId)).toEqual([10, 15]));
  test("détecte si un produit est favori", () => expect(isFavorite([{ productId: 99, refType: "PRODUCT" }], { productId: 99, refType: "PRODUCT" })).toBe(true));
});
