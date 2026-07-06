import { beforeEach, describe, expect, test, vi } from "vitest";
function createMemoryCache() { const store = new Map(); return { set(key, value, ttlMs = 60000) { store.set(key, { value, expiresAt: Date.now() + ttlMs }); }, get(key) { const entry = store.get(key); if (!entry) return null; if (Date.now() > entry.expiresAt) { store.delete(key); return null; } return entry.value; } }; }
describe("cache TTL", () => {
  let cache;
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-01-01T00:00:00Z")); cache = createMemoryCache(); });
  test("retourne la valeur avant expiration", () => { cache.set("products", [{ id: 1 }], 1000); vi.advanceTimersByTime(500); expect(cache.get("products")).toEqual([{ id: 1 }]); });
  test("retourne null après expiration", () => { cache.set("products", [{ id: 1 }], 1000); vi.advanceTimersByTime(1500); expect(cache.get("products")).toBe(null); });
});
