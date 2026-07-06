import { expect } from "@playwright/test";

export async function expectNoHorizontalOverflow(page, viewportWidth) {
  const widths = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    html: document.documentElement.scrollWidth,
  }));

  expect(Math.max(widths.body, widths.html)).toBeLessThanOrEqual(viewportWidth + 2);
}
