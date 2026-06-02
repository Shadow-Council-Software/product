import type { Page } from '@playwright/test';

export async function waitForLcarsReady(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('lcars-bridge').waitFor({ state: 'visible' });
  await page.getByTestId('ops.overview').waitFor({ state: 'visible' });
}

export async function openEnvironmental(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Environment' }).first().click();
  await page.getByTestId('env.subsystem').waitFor({ state: 'visible' });
  await page.getByTestId('environmental-panel').waitFor({ state: 'visible' });
}

export async function setClearance(page: Page, tier: 'Guest' | 'Crew' | 'Captain'): Promise<void> {
  await page.getByTestId('chrome.session-select').selectOption(tier);
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  if (overflow) {
    throw new Error('Page has horizontal overflow at current viewport');
  }
}
