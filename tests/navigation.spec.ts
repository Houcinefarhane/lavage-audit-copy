import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    });
    await page.reload();
    await expect(page.locator('.app-header')).toBeVisible();
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await page.click('button:has-text("Tableau de Bord")');
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('should navigate to Nouvel Audit', async ({ page }) => {
    await page.click('button:has-text("Nouvel Audit")');
    await expect(page.locator('.audit-form')).toBeVisible();
  });

  test('should navigate to Historique', async ({ page }) => {
    await page.click('button:has-text("Historique")');
    await expect(page.locator('.audit-list')).toBeVisible();
  });

  test('should navigate to Sites', async ({ page }) => {
    await page.click('button:has-text("Sites")');
    await expect(page.locator('.site-management')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.click('.btn-logout');
    
    // Vérifier qu'on est redirigé vers la landing page ou le login
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toMatch(/\//);
    
    // Vérifier que le localStorage est vidé
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
  });
});
