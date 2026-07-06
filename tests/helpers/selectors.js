import { expect } from "@playwright/test";

function normalizeTestIds(testIds) {
  if (Array.isArray(testIds)) return testIds.filter(Boolean);
  if (typeof testIds === "string" && testIds.trim()) return [testIds];
  throw new Error("Un data-testid ou un tableau de data-testid est requis.");
}

function escapeForCssAttribute(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildTestIdSelector(testIds) {
  return normalizeTestIds(testIds)
    .map((testId) => `[data-testid="${escapeForCssAttribute(testId)}"]`)
    .join(", ");
}

export function testIdLocator(page, testIds) {
  return page.locator(buildTestIdSelector(testIds));
}

export async function firstVisibleByTestId(page, testIds, options = {}) {
  const ids = normalizeTestIds(testIds);
  const timeout = options.timeout ?? 15000;
  const locator = testIdLocator(page, ids).filter({ visible: true }).first();

  await expect(
    locator,
    `Aucun élément visible trouvé pour les data-testid : ${ids.join(", ")}`
  ).toBeVisible({ timeout });

  return locator;
}

export async function expectVisibleByTestId(page, testIds, options = {}) {
  return firstVisibleByTestId(page, testIds, options);
}

export async function clickByTestId(page, testIds, options = {}) {
  const locator = await firstVisibleByTestId(page, testIds, options);
  await locator.click();
  return locator;
}

export async function fillByTestId(page, testIds, value, options = {}) {
  const locator = await firstVisibleByTestId(page, testIds, options);
  await locator.fill(value);
  return locator;
}

export async function countByTestIds(page, testIds) {
  let total = 0;
  for (const testId of normalizeTestIds(testIds)) {
    total += await page.getByTestId(testId).count().catch(() => 0);
  }
  return total;
}

export async function isAnyTestIdVisible(page, testIds) {
  for (const testId of normalizeTestIds(testIds)) {
    const visible = await page
      .getByTestId(testId)
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    if (visible) return true;
  }
  return false;
}

export async function optionalClickByTestId(page, testIds, options = {}) {
  const timeout = options.timeout ?? 1500;
  const locator = testIdLocator(page, testIds).filter({ visible: true }).first();
  const visible = await locator.isVisible({ timeout }).catch(() => false);
  if (!visible) return false;
  await locator.click();
  return true;
}
