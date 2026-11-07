import type { Page } from '@playwright/test';

export const SECTIONS = [
  'hero',
  'facts',
  'features',
  'recovery',
  'science',
  'widgets',
  'privacy',
  'compare',
  'run-recovery',
  'faq',
  'get',
  'footer',
] as const;

const STILL = '.nav, .skip-link { visibility: hidden !important; }';

export async function openPage(page: Page, { hideChrome = true }: { hideChrome?: boolean } = {}) {
  await page.goto('/', { waitUntil: 'load' });
  if (hideChrome) await page.addStyleTag({ content: STILL });
  await loadEverything(page);
}

// Below-the-fold images are lazy: make them eager and wait until each one has decoded.
export async function loadEverything(page: Page) {
  await page.evaluate(async () => {
    const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (const img of Array.from(document.images)) img.loading = 'eager';
    await Promise.all(Array.from(document.images).map((img) => Promise.race([img.decode().catch(() => undefined), timeout(8000)])));
    await document.fonts.ready;
  });
  await page.waitForTimeout(150);
}
