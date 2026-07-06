import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth.js";
import { openFirstProduct } from "./helpers/navigation.js";

async function addFirstProductToCart(page) {
  await openFirstProduct(page);
  await page.getByTestId("product-add-to-cart").click();
  await page.waitForLoadState("networkidle").catch(() => {});
}

test("CART-01 - panier accessible", async ({ page }) => {
  await page.goto("/cart");

  await expect(
    page.locator('[data-testid="cart-page"], [data-testid="cart-empty-state"], [data-testid="cart-auth-banner"]').first()
  ).toBeVisible({ timeout: 15000 });
});

test("CART-02 - ajout produit connecté", async ({ page }) => {
  await login(page);
  await addFirstProductToCart(page);

  await page.goto("/cart");
  await expect(page.getByTestId("cart-item-card").first()).toBeVisible({ timeout: 20000 });
});

test("CART-03 - modification quantité panier", async ({ page }) => {
  await login(page);
  await addFirstProductToCart(page);

  await page.goto("/cart");
  const item = page.getByTestId("cart-item-card").first();
  await expect(item).toBeVisible({ timeout: 20000 });

  const quantity = item.getByTestId("cart-item-quantity");
  const before = await quantity.innerText();
  await item.getByTestId("cart-item-increase").click();
  await expect(quantity).not.toHaveText(before, { timeout: 15000 });
});

test("CART-04 - suppression article", async ({ page }) => {
  await login(page);
  await addFirstProductToCart(page);

  await page.goto("/cart");
  const item = page.getByTestId("cart-item-card").first();
  await expect(item).toBeVisible({ timeout: 20000 });
  await item.getByTestId("cart-item-remove").click();

  await expect(item).toBeHidden({ timeout: 15000 }).catch(async () => {
    await expect(page.getByTestId("cart-empty-state")).toBeVisible({ timeout: 15000 });
  });
});

test("CART-05 - bouton validation panier présent", async ({ page }) => {
  await login(page);
  await addFirstProductToCart(page);

  await page.goto("/cart");
  await expect(page.getByTestId("cart-submit-button")).toBeVisible({ timeout: 20000 });
});
