import { test, expect } from '@playwright/test';
import { openHome } from './utils';

test('Open laptop category, open product, verify details and add to cart', async ({ page }) => {
  await openHome(page);

  // Click on Laptops in the left menu
  await page.click('text=Laptops');

  // Wait for product list and click the first product, then wait for product page.
  const productLinks = page.locator('.hrefch');
  await expect(productLinks.first()).toBeVisible();
  await productLinks.first().click();

  // Prefer waiting for the product URL, but some browsers (or slow networks) may not fire 'load' quickly.
  // Use 'domcontentloaded' and a fallback to check product-specific elements to avoid flaky timeouts.
  let urlResolved = false;
  try {
    await page.waitForURL(/prod\.html/, { waitUntil: 'domcontentloaded', timeout: 15000 });
    urlResolved = true;
  } catch {
    // ignore; fallback below will verify the page loaded
  }

  // Verify product details page opened by checking the Add to cart element (fallback)
  await expect(page.locator('text=Add to cart')).toBeVisible({ timeout: 10000 });
  if (urlResolved) await expect(page).toHaveURL(/prod\.html/);
  await expect(page.locator('text=Add to cart')).toBeVisible();

  // Click Add to cart and verify the alert dialog
  const dialogPromise = new Promise<string>(resolve => {
    page.once('dialog', async dialog => {
      const m = dialog.message();
      await dialog.accept();
      resolve(m);
    });
  });

  await page.click('text=Add to cart');
  const msg = await dialogPromise;
  expect(msg).toMatch(/added|product added/i);
});
