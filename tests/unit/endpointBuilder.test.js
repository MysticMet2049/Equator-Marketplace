import { describe, expect, test } from "vitest";
function buildEndpoint(template = "", params = {}) { if (!template) return ""; return template.replace(/\{(\w+)\}/g, (_, key) => { const value = params[key]; if (value === undefined || value === null || value === "") throw new Error(`Paramètre manquant pour l’endpoint : ${key}`); return encodeURIComponent(String(value)); }); }
function hasConfiguredEndpoint(endpoint) { return Boolean(endpoint && String(endpoint).trim()); }
describe("favorite endpoint builder", () => {
  test("remplace productId dans l’URL", () => expect(buildEndpoint("/api/products/{productId}/favorite", { productId: 45 })).toBe("/api/products/45/favorite"));
  test("remplace storeId dans l’URL", () => expect(buildEndpoint("/api/stores/{storeId}/favorite", { storeId: 9 })).toBe("/api/stores/9/favorite"));
  test("encode les paramètres spéciaux", () => expect(buildEndpoint("/api/search/{query}", { query: "iphone 13 pro" })).toBe("/api/search/iphone%2013%20pro"));
  test("lève une erreur si un paramètre est absent", () => expect(() => buildEndpoint("/api/products/{productId}/favorite", {})).toThrow("Paramètre manquant"));
  test("détecte un endpoint configuré", () => { expect(hasConfiguredEndpoint("/api/test")).toBe(true); expect(hasConfiguredEndpoint("")).toBe(false); });
});
