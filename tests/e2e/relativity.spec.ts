
import { test, expect } from '@playwright/test';

test('Relativity mode geodesic controls', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Relativity Mode');
  
  await expect(page.getByText('Metric Playground')).toBeVisible();
  
  // Trace button
  const traceBtn = page.getByText('Trace Path');
  await expect(traceBtn).toBeVisible();
  await traceBtn.click();
  
  // Clear button
  await expect(page.getByText('Clear')).toBeVisible();
});