import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function openHome(page: Page) {
  const url = 'https://www.demoblaze.com/';
  await page.goto(url);
  await expect(page).toHaveURL(/demoblaze\.com/);
}
