import { test, expect } from '@playwright/test';
import { setClearance, waitForLcarsReady } from './helpers.js';

/** W-CT-01: Guest actuation → denial overlay; read-only escape */
test.describe('W-CT-01 ClearanceOverlay', () => {
  test('Guest escalate shows denial dialog and dismiss returns to console', async ({ page }) => {
    await waitForLcarsReady(page);
    await setClearance(page, 'Guest');

    await page.getByTestId('escalate-alert-demo').click();

    const overlay = page.getByTestId('clearance-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('heading', { name: 'Denied' })).toBeVisible();
    await expect(overlay).toContainText('Environmental control requires Crew clearance');
    await expect(overlay).toContainText('Your session: Guest');

    await overlay.getByRole('button', { name: 'Return to read-only view' }).click();
    await expect(overlay).toBeHidden();
    await expect(page.getByTestId('ops.overview')).toBeVisible();
  });
});
