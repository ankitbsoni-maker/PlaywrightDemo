import { test, expect } from '@playwright/test';
import { openHome } from './utils';

test('Home banner auto-scrolls and has multiple banners', async ({ page }) => {
  await openHome(page);

  const items = page.locator('.carousel-item');
  const count = await items.count();
  expect(count).toBeGreaterThan(1);

  const getActiveIndex = async () => {
    return await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('.carousel-item'));
      return list.findIndex(el => el.classList.contains('active'));
    });
  };

  const initial = await getActiveIndex();

  // Wait up to 10s for the active slide to change (carousel auto-scroll)
  await page.waitForFunction((init) => {
    const list = Array.from(document.querySelectorAll('.carousel-item'));
    return list.findIndex(el => el.classList.contains('active')) !== init;
  }, initial, { timeout: 10000 });

  const later = await getActiveIndex();
  expect(later).not.toBe(initial);
});
