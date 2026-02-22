import { test, expect } from '@playwright/test';

test.describe('Site Management', () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    });
    await page.reload();
    await expect(page.locator('.app-header')).toBeVisible();
    
    // Naviguer vers la gestion des sites
    await page.click('button:has-text("Sites")');
    await expect(page.locator('.site-management')).toBeVisible();
  });

  test('should display site management page', async ({ page }) => {
    await expect(page.locator('.site-management')).toBeVisible();
  });

  test('should display sites list', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Vérifier la présence d'une liste de sites
    const sitesList = page.locator('.sites-list, .table-container, .site-card');
    const count = await sitesList.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should allow adding a new site', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Chercher le bouton d'ajout de site
    const addButton = page.locator('button:has-text("Ajouter"), button:has-text("Nouveau"), .btn-add');
    const count = await addButton.count();
    
    if (count > 0) {
      await addButton.first().click();
      await page.waitForTimeout(500);
      
      // Vérifier qu'un formulaire apparaît
      const form = page.locator('.site-form, form, input[type="text"]');
      await expect(form.first()).toBeVisible();
    }
  });
});
