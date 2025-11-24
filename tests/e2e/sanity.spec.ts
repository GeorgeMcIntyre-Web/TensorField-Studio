import { test, expect } from '@playwright/test';

test.describe('TensorField Studio Sanity', () => {
  test('App loads and renders default sandbox mode', async ({ page }) => {
    await page.goto('/');

    // 1. Check Main Title/Nav
    await expect(page.getByText('TensorFieldStudio')).toBeVisible({ timeout: 10000 });

    // 2. Check Default View (Tensor Sandbox)
    await expect(page.getByText('Tensor Components')).toBeVisible();

    // 3. Verify Canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeAttached();

    // 4. Navigation works
    await page.getByRole('button', { name: 'Mechanics Mode' }).click();
    await expect(page.getByText('Cantilever Beam')).toBeVisible();
  });
});