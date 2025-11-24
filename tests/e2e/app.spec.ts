import { test, expect } from '@playwright/test';

test('loads and navigates modes', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle(/TensorField Studio/);
  
  // Default is sandbox
  await expect(page.getByText('Tensor Components')).toBeVisible();

  // Switch to Mechanics
  await page.click('text=Mechanics Mode');
  await expect(page.getByText('Cantilever Beam')).toBeVisible();

  // Switch to Relativity
  await page.click('text=Relativity Mode');
  await expect(page.getByText('Metric Playground')).toBeVisible();
});

test('updates tensor trace', async ({ page }) => {
    await page.goto('/');
    
    // Find the first input (xx component)
    const input = page.locator('input[type="number"]').first();
    await input.fill('200');
    
    // Check trace update (default is 100 + 50 + 10 = 160. New is 200 + 50 + 10 = 260)
    await expect(page.locator('text=260.00')).toBeVisible();
});