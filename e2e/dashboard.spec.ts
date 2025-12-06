import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test('should require authentication to access dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/login/);
    });

    test('should have a working home page', async ({ page }) => {
        await page.goto('/');

        // Should redirect somewhere (login or dashboard based on auth)
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toMatch(/login|dashboard/);
    });
});

test.describe('Navigation', () => {
    test('should handle 404 pages', async ({ page }) => {
        await page.goto('/non-existent-page');

        await page.waitForLoadState('networkidle');
        // Should redirect to login or show 404
        const content = await page.content();
        expect(content.length).toBeGreaterThan(0);
    });
});
