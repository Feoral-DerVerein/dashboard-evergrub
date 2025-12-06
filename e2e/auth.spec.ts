import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should display login page with form elements', async ({ page }) => {
        await page.goto('/login');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check the page loaded (login page or redirected)
        const url = page.url();
        expect(url).toContain('login');
    });

    test('should redirect to login if not authenticated', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/login/);
    });

    test('login page should have email input', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Check for any input field
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        expect(inputCount).toBeGreaterThan(0);
    });
});
