import { test, expect } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers/layout.js";
import { openFirstProduct } from "./helpers/navigation.js";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablette", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`RESP - accueil ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByTestId("home-page")).toBeVisible({ timeout: 15000 });
    await expectNoHorizontalOverflow(page, viewport.width);
  });

  test(`RESP - marketplace ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/marketplace");

    await expect(page.getByTestId("marketplace-page")).toBeVisible({ timeout: 15000 });
    await expectNoHorizontalOverflow(page, viewport.width);
  });

  test(`RESP - page produit ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openFirstProduct(page);

    await expect(page.getByTestId("product-detail-page")).toBeVisible({ timeout: 15000 });
    await expectNoHorizontalOverflow(page, viewport.width);
  });
}
