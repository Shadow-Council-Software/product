import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { assertNoHorizontalOverflow, openEnvironmental, waitForLcarsReady } from './helpers.js';

test.describe('Layout & visual (1280×720 certified)', () => {
  test('baseline screenshot — ops.overview bridge', async ({ page }) => {
    await waitForLcarsReady(page);
    await assertNoHorizontalOverflow(page);
    await expect(page).toHaveScreenshot('lcars-bridge-ops-overview.png', {
      fullPage: true,
    });
  });

  test('environmental panel on env.subsystem', async ({ page }) => {
    await waitForLcarsReady(page);
    await openEnvironmental(page);
    const panel = page.getByTestId('environmental-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveScreenshot('environmental-panel.png');
  });

  test('no serious accessibility violations on load', async ({ page }) => {
    await waitForLcarsReady(page);
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual(
      []
    );
  });
});
