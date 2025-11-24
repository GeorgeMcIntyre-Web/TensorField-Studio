
import { test, expect } from '@playwright/test';

test('Sandbox updates trace and health', async ({ page }) => {
  await page.goto('/');
  
  // Ensure we are in sandbox
  await expect(page.getByText('Tensor Components')).toBeVisible();

  // Input diagonal components 10, 10, 10
  const inputs = page.locator('input[type="number"]');
  await inputs.nth(0).fill('10');
  await inputs.nth(4).fill('10');
  await inputs.nth(8).fill('10');

  // Trace should be 30
  await expect(page.locator('text=30.00')).toBeVisible();
  
  // Health should be positive definite
  await expect(page.getByText('Positive Definite')).toBeVisible();

  // Make one negative
  await inputs.nth(0).fill('-10');
  // Trace becomes 10
  await expect(page.locator('text=10.00')).toBeVisible();
  // Health becomes Indefinite
  await expect(page.getByText('Indefinite')).toBeVisible();
});
