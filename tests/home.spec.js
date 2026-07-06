import { test, expect } from "@playwright/test";
import { collectConsoleErrors } from "./helpers/consoleErrors.js";

test("HOME-01 - accueil sans erreur console", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");

  await expect(page.getByTestId("home-page")).toBeVisible({ timeout: 15000 });
  expect(errors).toEqual([]);
});

test("HOME-02 - hero carousel stores visible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("home-hero-carousel")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("home-hero-store-card").first()).toBeVisible({ timeout: 15000 });
});

test("HOME-03/04/05 - sections produits de l'accueil", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("home-promo-products-section")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("home-featured-products-section")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("home-catalog-products-section")).toBeVisible({ timeout: 15000 });
});

test("HOME-06 - clic produit vers page détail", async ({ page }) => {
  await page.goto("/");

  const product = page.getByTestId("product-card").first();
  await expect(product).toBeVisible({ timeout: 20000 });
  await product.click();

  await expect(page).toHaveURL(/\/product\//, { timeout: 15000 });
  await expect(page.getByTestId("product-detail-page")).toBeVisible({ timeout: 15000 });
});

test("HOME-07 - footer global", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("global-footer")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("footer-brand")).toBeVisible();
  await expect(page.getByTestId("footer-newsletter")).toBeVisible();
});
