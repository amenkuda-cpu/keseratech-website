import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import { COMPANY } from '@/content/site';
import './globals.css';

// Clash Display (a bold geometric display face) for headings, Manrope for body text, Plex Mono for
// small labels. Clash Display is served by Fontshare's own CDN: its licence (ITF FFL) allows web use
// but not redistributing the font files, and this repository is public, so the files are not committed.
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

const SITE_URL = process.env.SITE_URL ?? `https://${COMPANY.website}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Kesera Technologies | Software, Websites, Apps & AI in Zimbabwe', template: '%s | Kesera' },
  description:
    'Kesera Technologies develops software, AI, agricultural and energy technology in Zimbabwe, builds sustainable homes and furniture from recycled and upcycled materials, and builds websites, apps and software for businesses.',
  applicationName: 'Kesera',
  openGraph: { type: 'website', siteName: 'Kesera Technologies', locale: 'en_ZW' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#100e0c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${manrope.variable} ${plexMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
