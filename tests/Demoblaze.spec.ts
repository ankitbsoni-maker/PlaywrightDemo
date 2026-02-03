import { test, expect } from '@playwright/test';
import { openHome } from './utils';

test('Demoblaze signup flow', async ({ page }) => {
	await openHome(page);

	// Open Sign up modal (use the navbar link id to avoid matching modal title)
	await page.click('#signin2');

	// Verify sign up popup is visible
	const usernameInput = page.locator('#sign-username');
	const passwordInput = page.locator('#sign-password');
	await usernameInput.waitFor({ state: 'visible' });
	await expect(usernameInput).toBeVisible();
	await expect(passwordInput).toBeVisible();

	// Fill credentials
	const username = `user_${Date.now()}`;
	const password = 'Password123!';
	await usernameInput.fill(username);
	await passwordInput.fill(password);
	// Verify fields received values; if not, set them via DOM (handles flaky input in some browsers)
	try {
		await expect(usernameInput).toHaveValue(username);
		await expect(passwordInput).toHaveValue(password);
	} catch {
		await usernameInput.evaluate((el, v) => { (el as HTMLInputElement).value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, username);
		await passwordInput.evaluate((el, v) => { (el as HTMLInputElement).value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, password);
		await expect(usernameInput).toHaveValue(username);
		await expect(passwordInput).toHaveValue(password);
	}
	// Click the Sign up button and verify the alert message
	const dialogPromise = new Promise<string>((resolve) => {
		page.once('dialog', async (dialog) => {
			const msg = dialog.message();
			await dialog.accept();
			resolve(msg);
		});
	});

	await page.click('button[onclick="register()"]');
	const dialogMessage = await dialogPromise;
	expect(dialogMessage).toMatch(/sign up successful/i);
});

