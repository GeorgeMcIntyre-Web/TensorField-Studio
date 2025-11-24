import { test, expect } from '@playwright/test';

test.describe('Critical Sanity Check', () => {
  
  test('App renders header and navigates', async ({ page }) => {
    await page.goto('/');

    // 1. Wait for Root
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });

    // 2. Check for the Force-Visible Header
    await expect(page.getByText('UI Loaded')).toBeVisible();

    // 3. Verify Navigation Bar
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // 4. Default Mode: Tensor Sandbox
    await expect(page.locator('text=Tensor Components')).toBeVisible();

    // 5. Navigate to Mechanics
    await page.click('text=Mechanics Mode');
    await expect(page.locator('text=Cantilever Beam')).toBeVisible();
  });
});