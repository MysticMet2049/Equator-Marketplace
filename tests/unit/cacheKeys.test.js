import { describe, expect, test } from "vitest";
function buildCacheKey(namespace, params = {}) { const sortedParams = Object.keys(params).sort().reduce((acc, key) => { const value = params[key]; if (value !== undefined && value !== null && value !== "") acc[key] = value; return acc; }, {}); return `${namespace}:${JSON.stringify(sortedParams)}`; }
describe("cache key builder", () => {
  test("construit une clé stable", () => expect(buildCacheKey("products", { page: 1, category: "Électronique" })).toBe('products:{"category":"Électronique","page":1}'));
  test("retourne la même clé même si l’ordre des paramètres change", () => expect(buildCacheKey("products", { page: 1, category: "Mode" })).toBe(buildCacheKey("products", { category: "Mode", page: 1 })));
  test("ignore les paramètres vides", () => expect(buildCacheKey("products", { page: 1, search: "", category: null })).toBe('products:{"page":1}'));
});
