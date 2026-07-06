import { test, expect } from "@playwright/test";
import { clearSession, login } from "./helpers/auth.js";

test("ACCOUNT-01 - compte visible après connexion", async ({ page }) => {
  await login(page);

  // Après connexion, l'application redirige vers la page d'accueil
  await expect(page).toHaveURL(/\/$/);

  // Ensuite, on ouvre manuellement la page compte
  await page.goto("/account");

  await expect(page.getByTestId("account-page")).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByTestId("account-profile-section")).toBeVisible({
    timeout: 15000,
  });
});

test("ACCOUNT-02 desktop - clic profil non connecté ouvre la connexion", async ({ page, context }) => {
  await clearSession(page, context);

  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/");

  // Dans ton interface actuelle, l'icône profil non connecté est un lien vers /login
  await page.locator('header a[href="/login"]').first().click();

  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

  await expect(
    page.locator('[data-testid="login-page"], form, input[type="password"]').first()
  ).toBeVisible({ timeout: 15000 });
});

test("ACCOUNT-03 - favoris visibles", async ({ page }) => {
  await login(page);
  await page.goto("/account");

  await page.getByTestId("account-sidebar-favorites").click();
  await expect(page.getByTestId("account-favorites-section")).toBeVisible({ timeout: 15000 });
});

test("ACCOUNT-04 - comptes enseignes visibles", async ({ page }) => {
  await login(page);
  await page.goto("/account");

  await page.getByTestId("account-sidebar-stores").click();
  await expect(page.getByTestId("account-store-accounts-section")).toBeVisible({ timeout: 15000 });
});

test("ACCOUNT-05 - historique par enseigne si un compte existe", async ({ page }) => {
  await login(page);
  await page.goto("/account");

  await page.getByTestId("account-sidebar-stores").click();
  await expect(page.getByTestId("account-store-accounts-section")).toBeVisible({ timeout: 15000 });

  const card = page.getByTestId("account-store-account-card").first();
  if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
    await card.click();
    await expect(page.getByTestId("account-store-purchase-history")).toBeVisible({ timeout: 15000 });
  }
});

test("ACCOUNT-06 - déconnexion", async ({ page }) => {
  await login(page);
  await page.goto("/account");

  await page.getByTestId("account-logout-button").click();
  await expect(page.locator('a[href="/login"]').first()).toBeVisible({ timeout: 15000 });
});
