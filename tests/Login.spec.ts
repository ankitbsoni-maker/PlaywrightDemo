import { test, expect } from '@playwright/test';
import { openHome } from './utils';

// Provide credentials via env vars for safety. Example:
// DEMO_USER=myuser DEMO_PASS=mypass npx playwright test tests/Login.spec.ts
const USERNAME = process.env.DEMO_USER ?? 'demoUser';
const PASSWORD = process.env.DEMO_PASS ?? 'demoPass';

test('Demoblaze login flow', async ({ page }) => {
  await openHome(page);

  // Open login modal
  await page.click('#login2');

  const usernameInput = page.locator('#loginusername');
  const passwordInput = page.locator('#loginpassword');
  await expect(usernameInput).toBeVisible();

  // Fill credentials with fallback for flaky inputs
  await usernameInput.fill(USERNAME);
  await passwordInput.fill(PASSWORD);
  try {
    await expect(usernameInput).toHaveValue(USERNAME);
    await expect(passwordInput).toHaveValue(PASSWORD);
  } catch {
    await usernameInput.evaluate((el, v) => { (el as HTMLInputElement).value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, USERNAME);
    await passwordInput.evaluate((el, v) => { (el as HTMLInputElement).value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, PASSWORD);
    await expect(usernameInput).toHaveValue(USERNAME);
    await expect(passwordInput).toHaveValue(PASSWORD);
  }

  // Click login and verify successful login by checking the welcome element
  await page.click('button[onclick="logIn()"]');

  const nameLocator = page.locator('#nameofuser');
  try {
    await nameLocator.waitFor({ state: 'visible', timeout: 5000 });
    await expect(nameLocator).toHaveText(new RegExp(USERNAME, 'i'));
  } catch {
    // If user isn't logged in, an alert dialog explains why — capture it for debugging
    const dialog = await page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);
    if (dialog) {
      const msg = dialog.message();
      await dialog.accept();
      throw new Error('Login failed: ' + msg);
    }
    throw new Error('Login failed: timed out waiting for welcome message');
  }
});
