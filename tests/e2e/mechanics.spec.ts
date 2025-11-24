
import { test, expect } from '@playwright/test';

test('Mechanics mode switches examples', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Mechanics Mode');
  
  await expect(page.getByText('Cantilever Beam')).toBeVisible();
  await expect(page.getByText('End Load (P)')).toBeVisible();

  await page.click('text=Plate w/ Hole');
  await expect(page.getByText('Remote Tension (S)')).toBeVisible();
});

test('Load factor and animation toggle', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Mechanics Mode');
    
    // Check load factor input exists
    const slider = page.locator('input[type="range"]').nth(1); 
    await expect(slider).toBeVisible();
    
    // Toggle animation
    const playBtn = page.locator('button:has(.lucide-play)');
    await playBtn.click();
    
    // Pause button should appear
    await expect(page.locator('button:has(.lucide-pause)')).toBeVisible();
});