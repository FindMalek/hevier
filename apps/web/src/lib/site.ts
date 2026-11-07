const REPO = 'https://github.com/hamzaamry/hevier';

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:4310';
}

export const SITE = {
  name: 'Hevier',
  url: siteUrl(),
  title: 'Hevier: a free workout tracker that shows what has recovered',
  description:
    'Free, open-source workout tracker for Android. A recovery map, set counts backed by studies, no account, no ads, no subscription. Your data stays on your phone.',
  repo: REPO,
  releases: `${REPO}/releases`,
  issues: `${REPO}/issues`,
  contributing: `${REPO}/blob/main/CONTRIBUTING.md`,
  license: `${REPO}/blob/main/LICENSE`,
  scienceDocs: `${REPO}/tree/main/docs/science`,
  readme: `${REPO}#readme`,
} as const;

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#recovery', label: 'Recovery map' },
  { href: '#science', label: 'Science' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#faq', label: 'FAQ' },
] as const;
