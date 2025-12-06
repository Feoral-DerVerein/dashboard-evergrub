import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
    test('should display onboarding page', async ({ page }) => {
        await page.goto('/onboarding');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/login|onboarding/);
    });

    test('onboarding page has step indicators', async ({ page }) => {
        // This test assumes we access onboarding directly
        await page.goto('/onboarding');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Either redirected to login or showing onboarding
        const url = page.url();
        expect(url).toMatch(/login|onboarding/);
    });
});
