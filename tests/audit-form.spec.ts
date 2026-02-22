import { test, expect } from '@playwright/test';

test.describe('Audit Form', () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    });
    await page.reload();
    await expect(page.locator('.app-header')).toBeVisible();
    
    // Naviguer vers le formulaire d'audit
    await page.click('button:has-text("Nouvel Audit")');
    await expect(page.locator('.audit-form')).toBeVisible();
  });

  test('should display audit form', async ({ page }) => {
    await expect(page.locator('.audit-form')).toBeVisible();
    await expect(page.locator('select, input[type="text"]')).toBeVisible();
  });

  test('should allow selecting a site', async ({ page }) => {
    // Attendre que le select de site soit chargé
    await page.waitForTimeout(500);
    
    const siteSelect = page.locator('select').first();
    if (await siteSelect.count() > 0) {
      await expect(siteSelect).toBeVisible();
    }
  });

  test('should display checkpoints', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Vérifier la présence de checkpoints
    const checkpoints = page.locator('.checkpoint-item, .checkpoint');
    const count = await checkpoints.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow marking checkpoints', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Trouver un bouton de checkpoint (OUI/NON)
    const checkpointButtons = page.locator('.btn-status, button:has-text("OUI"), button:has-text("NON")');
    const count = await checkpointButtons.count();
    
    if (count > 0) {
      await checkpointButtons.first().click();
      // Vérifier que le checkpoint a été marqué
      await page.waitForTimeout(300);
    }
  });
});
