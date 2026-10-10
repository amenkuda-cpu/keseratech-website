import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { COMPANY } from '@/content/site';
import './globals.css';

// Archivo with its width axis: expanded for display type (echoing the wordmark), normal for text.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

const SITE_URL = process.env.SITE_URL ?? `https://${COMPANY.website}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Kesera Technologies — Building what’s next', template: '%s — Kesera' },
  description:
    'Kesera Technologies develops software, AI, agricultural and energy technology in Zimbabwe, builds sustainable homes and furniture from recycled and upcycled materials, and builds websites, apps and software for businesses.',
  applicationName: 'Kesera',
  openGraph: { type: 'website', siteName: 'Kesera Technologies', locale: 'en_ZW' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#05060b',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
