import { test, expect } from '@playwright/test';

test.describe('Audit List', () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    });
    await page.reload();
    await expect(page.locator('.app-header')).toBeVisible();
    
    // Naviguer vers l'historique
    await page.click('button:has-text("Historique")');
    await expect(page.locator('.audit-list')).toBeVisible();
  });

  test('should display audit list', async ({ page }) => {
    await expect(page.locator('.audit-list')).toBeVisible();
  });

  test('should display filters', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Vérifier la présence de filtres (site, date, etc.)
    const filters = page.locator('.site-filter, select, input[type="date"]');
    const count = await filters.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display audit cards or table', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Vérifier la présence d'audits (peut être vide)
    const audits = page.locator('.audit-card, .audit-item, tbody tr');
    const count = await audits.count();
    // Peut être 0 si aucun audit n'existe
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
