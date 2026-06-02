import { test, expect } from '@playwright/test';
import { assertNoHorizontalOverflow, openEnvironmental, setClearance, waitForLcarsReady } from './helpers.js';

test.describe('LCARS smoke', () => {
  test('loads ops.overview bridge with station roster', async ({ page }) => {
    await waitForLcarsReady(page);

    await expect(page.getByRole('heading', { name: 'Bridge at a Glance' })).toBeVisible();
    await expect(page.getByTestId('subsystem-grid')).toBeVisible();
    await expect(page.getByText('Nest Thermostat (mock)')).toBeVisible();

    await assertNoHorizontalOverflow(page);
  });

  test('Crew can enable setpoint command on env.subsystem', async ({ page }) => {
    await waitForLcarsReady(page);
    await openEnvironmental(page);
    await setClearance(page, 'Crew');

    await expect(page.getByRole('button', { name: 'Command setpoint' })).toBeEnabled();
  });
});
