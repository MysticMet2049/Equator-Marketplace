import { expect } from "@playwright/test";

export async function clearSession(page, context) {
  await context.clearCookies();
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function login(page) {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Identifiants manquants : vérifie E2E_USERNAME et E2E_PASSWORD dans .env"
    );
  }

  await page.goto("/login");

  const usernameInput = page
    .locator(
      '[data-testid="login-username"], [data-testid="username"], input[name="username"], input[autocomplete="username"]'
    )
    .first();

  const passwordInput = page
    .locator(
      '[data-testid="login-password"], input[name="password"], input[type="password"], input[autocomplete="current-password"]'
    )
    .first();

  const submitButton = page
    .locator('[data-testid="login-submit"], button[type="submit"]')
    .first();

  await expect(usernameInput).toBeVisible({ timeout: 15000 });

  await usernameInput.fill(username);
  await passwordInput.fill(password);

  await Promise.all([
    page.waitForURL(/\/$/, { timeout: 15000 }),
    submitButton.click(),
  ]);

  await expect(page.getByTestId("navbar")).toBeVisible({
    timeout: 15000,
  });
}