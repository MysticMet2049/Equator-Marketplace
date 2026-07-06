import { expect } from "@playwright/test";

export async function waitForProducts(page, timeout = 20000) {
  await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout });
}

export async function openFirstProduct(page, sourcePath = "/marketplace") {
  await page.goto(sourcePath);
  await waitForProducts(page);
  await page.getByTestId("product-card").first().click();
  await expect(page).toHaveURL(/\/product\//, { timeout: 15000 });
  await expect(page.getByTestId("product-detail-page")).toBeVisible({ timeout: 15000 });
}

export async function openFirstStore(page) {
  await page.goto("/stores");
  await expect(page.getByTestId("store-card-visit-link").first()).toBeVisible({ timeout: 20000 });
  await page.getByTestId("store-card-visit-link").first().click();
  await expect(page).toHaveURL(/\/stores\//, { timeout: 15000 });
  await expect(page.getByTestId("store-detail-page")).toBeVisible({ timeout: 15000 });
}
