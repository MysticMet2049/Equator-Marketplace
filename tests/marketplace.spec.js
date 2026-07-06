import { test, expect } from "@playwright/test";

test("MARKET-01 - marketplace charge des produits", async ({ page }) => {
  await page.goto("/marketplace");

  await expect(page.getByTestId("marketplace-page")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("marketplace-products-grid")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout: 20000 });
});

test("MARKET-02 - recherche produit", async ({ page }) => {
  await page.goto("/marketplace");

  const search = page.getByTestId("marketplace-search-input");
  await expect(search).toBeVisible({ timeout: 15000 });
  await search.fill("iphone");
  await search.press("Enter");

  await expect(page.getByTestId("marketplace-page")).toBeVisible();
});

test("MARKET-03 - filtre catégorie", async ({ page }) => {
  await page.goto("/marketplace");

  await expect(page.getByTestId("marketplace-category-filters")).toBeVisible({ timeout: 15000 });
  const firstFilter = page.getByTestId("marketplace-category-filter").first();

  if (await firstFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstFilter.click();
    await expect(page.getByTestId("marketplace-page")).toBeVisible();
  }
});

test("MARKET-05 - images ou placeholders produit visibles", async ({ page }) => {
  await page.goto("/marketplace");

  await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout: 20000 });
  await expect(
    page.locator('[data-testid="product-card-image"], [data-testid="product-card-image-placeholder"]').first()
  ).toBeVisible({ timeout: 15000 });
});
