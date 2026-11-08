import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { SITE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: '%s | Hevier' },
  description: SITE.description,
  applicationName: 'Hevier',
  keywords: [
    'workout tracker',
    'open source workout tracker',
    'free workout tracker',
    'muscle recovery map',
    'gym log',
    'local-first fitness app',
    'Android',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Hevier',
    title: 'Hevier: train hard, recover smart',
    description: SITE.description,
    url: '/',
    locale: 'en_US',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Hevier: train hard, recover smart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hevier: train hard, recover smart',
    description: SITE.description,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbfbfd',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
