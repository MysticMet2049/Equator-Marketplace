import { beforeEach, describe, expect, test } from "vitest";
function createMemoryCache() { const store = new Map(); return { set(key, value, ttlMs = 60000) { store.set(key, { value, expiresAt: Date.now() + ttlMs }); }, get(key) { const entry = store.get(key); if (!entry) return null; if (Date.now() > entry.expiresAt) { store.delete(key); return null; } return entry.value; }, remove(key) { store.delete(key); }, clear() { store.clear(); }, size() { return store.size; } }; }
describe("memory cache storage", () => {
  let cache;
  beforeEach(() => { cache = createMemoryCache(); });
  test("stocke et récupère une valeur", () => { cache.set("products", [{ id: 1 }]); expect(cache.get("products")).toEqual([{ id: 1 }]); });
  test("retourne null si la clé n’existe pas", () => expect(cache.get("unknown")).toBe(null));
  test("supprime une valeur", () => { cache.set("products", [{ id: 1 }]); cache.remove("products"); expect(cache.get("products")).toBe(null); });
  test("vide tout le cache", () => { cache.set("products", [{ id: 1 }]); cache.set("stores", [{ id: 2 }]); cache.clear(); expect(cache.size()).toBe(0); });
});
