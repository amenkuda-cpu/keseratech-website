import type { Metadata } from 'next';

// One place that builds a page's search and share tags, so every page gets the same complete set:
// title, description, canonical URL, Open Graph and Twitter card with the share image.
// Next.js merges metadata shallowly, so a page's `openGraph` replaces the layout's: always pass images.

const SHARE_IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Kesera Technologies: websites, apps and AI in Zimbabwe' };

export function pageMetadata(p: { title: string; description: string; path: string; type?: 'website' | 'article'; published?: string }): Metadata {
  return {
    title: { absolute: p.title },
    description: p.description,
    // English-only site: a self-referencing hreflang plus x-default tells search engines there is no other version.
    alternates: { canonical: p.path, languages: { en: p.path, 'x-default': p.path } },
    openGraph: {
      type: p.type ?? 'website',
      siteName: 'Kesera Technologies',
      locale: 'en_ZW',
      title: p.title,
      description: p.description,
      url: p.path,
      images: [SHARE_IMAGE],
      ...(p.published ? { publishedTime: p.published } : {}),
    },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: [SHARE_IMAGE.url] },
  };
}
