import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openPage } from './helpers';

async function serious(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
}

test('no serious or critical axe violations', async ({ page }) => {
  await openPage(page, { hideChrome: false });
  expect(await serious(page)).toEqual([]);
});

test('no violations with the demo and an FAQ answer open', async ({ page }) => {
  await openPage(page, { hideChrome: false });
  await page.getByRole('button', { name: 'Leg day' }).click();
  await page.getByRole('button', { name: /^Quads/ }).click();
  await page.locator('#faq details').first().locator('summary').click();
  expect(await serious(page)).toEqual([]);
});
