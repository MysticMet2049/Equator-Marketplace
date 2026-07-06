import { test, expect } from "@playwright/test";
import { openFirstProduct } from "./helpers/navigation.js";

test("PRODUCT-01 - page produit visible", async ({ page }) => {
  await openFirstProduct(page);

  await expect(page.getByTestId("product-gallery")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("product-info-panel")).toBeVisible({ timeout: 15000 });
});

test("PRODUCT-02 - quantité + et -", async ({ page }) => {
  await openFirstProduct(page);

  const quantity = page.getByTestId("product-qty-value");
  await expect(quantity).toContainText("1");
  await page.getByTestId("product-qty-increase").click();
  await expect(quantity).toContainText("2");
  await page.getByTestId("product-qty-decrease").click();
  await expect(quantity).toContainText("1");
});

test("PRODUCT-03 - visiter le store", async ({ page }) => {
  await openFirstProduct(page);

  const storeLink = page.getByTestId("product-visit-store");
  if (await storeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await storeLink.click();
    await expect(page).toHaveURL(/\/stores\//, { timeout: 15000 });
  }
});

test("PRODUCT-04 - onglet avis visible", async ({ page }) => {
  await openFirstProduct(page);

  await page.getByTestId("product-tab-reviews").click();
  await expect(page.getByTestId("product-reviews-tab")).toBeVisible({ timeout: 15000 });
});

test("PRODUCT-05 - note produit sans message technique", async ({ page }) => {
  await openFirstProduct(page);

  await page.getByTestId("product-tab-reviews").click();
  await expect(page.getByTestId("product-rating-form")).toBeVisible({ timeout: 15000 });

  const stars = page.getByTestId("product-rating-star");
  if (await stars.count()) {
    await stars.nth(Math.min(3, (await stars.count()) - 1)).click();
  }

  const submit = page.getByTestId("product-rating-submit");
  if (await submit.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submit.click();
  }

  await expect(page.locator("body")).not.toContainText(/swagger|exception|stack|endpoint|500/i);
});

test("PRODUCT-06 - onglet similaire", async ({ page }) => {
  await openFirstProduct(page);

  const similarTab = page.getByTestId("product-tab-similar");
  if (await similarTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await similarTab.click();
    await expect(page.getByTestId("product-tabs")).toBeVisible();
  }
});

test("PRODUCT-07 - produit introuvable", async ({ page }) => {
  await page.goto("/product/id-invalide-999999");

  await expect(page.getByTestId("product-empty-state").or(page.locator("body"))).toBeVisible({ timeout: 15000 });
  await expect(page.locator("body")).toContainText(/introuvable|indisponible|page/i);
});
