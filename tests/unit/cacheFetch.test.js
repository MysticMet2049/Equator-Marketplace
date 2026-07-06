import { describe, expect, test, vi } from "vitest";
function createMemoryCache() { const store = new Map(); return { get(key) { return store.get(key) ?? null; }, set(key, value) { store.set(key, value); } }; }
async function fetchWithCache(cache, key, fetcher) { const cachedValue = cache.get(key); if (cachedValue) return cachedValue; const freshValue = await fetcher(); cache.set(key, freshValue); return freshValue; }
describe("fetchWithCache", () => {
  test("appelle le fetcher si aucune donnée n’est en cache", async () => { const cache = createMemoryCache(); const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]); const result = await fetchWithCache(cache, "products", fetcher); expect(fetcher).toHaveBeenCalledTimes(1); expect(result).toEqual([{ id: 1 }]); });
  test("retourne la donnée cache sans rappeler le fetcher", async () => { const cache = createMemoryCache(); cache.set("products", [{ id: 1 }]); const fetcher = vi.fn().mockResolvedValue([{ id: 2 }]); const result = await fetchWithCache(cache, "products", fetcher); expect(fetcher).not.toHaveBeenCalled(); expect(result).toEqual([{ id: 1 }]); });
});
