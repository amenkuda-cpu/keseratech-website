import type { Metadata, Viewport } from 'next';
import { Archivo, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { COMPANY } from '@/content/site';
import './globals.css';

// Fraunces (a soft, characterful serif) for headings; Archivo for body text; Plex Mono for small labels.
const fraunces = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'opsz'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
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
    <html lang="en" className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
