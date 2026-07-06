import { test, expect } from "@playwright/test";
import { openFirstStore } from "./helpers/navigation.js";

test("STORE-01 - liste des stores visible", async ({ page }) => {
  await page.goto("/stores");

  await expect(page.getByTestId("stores-page")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("store-card").first()).toBeVisible({ timeout: 20000 });
});

test("STORE-02 - nombre de produits visible sur store card", async ({ page }) => {
  await page.goto("/stores");

  await expect(page.getByTestId("store-card-product-count").first()).toBeVisible({ timeout: 20000 });
});

test("STORE-03 - ouvrir une page store", async ({ page }) => {
  await openFirstStore(page);
});

test("STORE-04 - sections produits store", async ({ page }) => {
  await openFirstStore(page);

  await expect(page.getByTestId("store-products-tab")).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[data-testid^="store-product-section-"]').first()).toBeVisible({ timeout: 15000 });
});

test("STORE-05 - carousel store suivant/précédent si présent", async ({ page }) => {
  await openFirstStore(page);

  const next = page.locator('[data-testid^="store-product-carousel-next-"]').first();
  if (await next.isVisible({ timeout: 3000 }).catch(() => false)) {
    await next.click();
    await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout: 15000 });
  }
});

test("STORE-06 - produit depuis store", async ({ page }) => {
  await openFirstStore(page);

  const product = page.getByTestId("product-card").first();
  if (await product.isVisible({ timeout: 5000 }).catch(() => false)) {
    await product.click();
    await expect(page).toHaveURL(/\/product\//, { timeout: 15000 });
  }
});
