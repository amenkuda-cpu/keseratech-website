// schema.org (JSON-LD) builders shared by every public page. Only facts the business has confirmed go
// here: no street address or opening hours until the owner supplies them (see OPENING_HOURS below).
import { COMPANY } from '@/content/site';
import type { Faq } from '@/content/seo/types';

export const SITE_URL = (process.env.SITE_URL ?? `https://${COMPANY.website}`).replace(/\/$/, '');
export const ORG_ID = `${SITE_URL}/#organization`;
export const BUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const INSTAGRAM_URL = 'https://www.instagram.com/kesera_tech';

/**
 * Opening hours for LocalBusiness data, e.g. [{ days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '17:00' }].
 * Left empty until the owner confirms the real hours: publishing guessed hours would mislead Google.
 */
export const OPENING_HOURS: { days: string[]; opens: string; closes: string }[] = [];

const phone = COMPANY.phone.replace(/\s/g, '');

export const abs = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export function localBusinessSchema() {
  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': BUSINESS_ID,
    name: 'Kesera Technologies',
    legalName: COMPANY.legal,
    slogan: 'Intelligence. Automation. Evolution.',
    url: SITE_URL,
    logo: abs('/brand/kesera-lockup.png'),
    image: abs('/opengraph-image.png'),
    telephone: phone,
    email: COMPANY.email,
    priceRange: '$$',
    address: { '@type': 'PostalAddress', addressLocality: 'Marondera', addressRegion: 'Mashonaland East', addressCountry: 'ZW' },
    areaServed: [
      { '@type': 'Country', name: 'Zimbabwe' },
      { '@type': 'City', name: 'Harare' },
      { '@type': 'City', name: 'Marondera' },
      { '@type': 'City', name: 'Bulawayo' },
    ],
    sameAs: [INSTAGRAM_URL],
    parentOrganization: { '@id': ORG_ID },
    ...(OPENING_HOURS.length
      ? { openingHoursSpecification: OPENING_HOURS.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })) }
      : {}),
  };
}

export function serviceSchema(s: { name: string; description: string; path: string; lowPriceCents?: number | null }) {
  return {
    '@type': 'Service',
    '@id': `${abs(s.path)}#service`,
    name: s.name,
    description: s.description,
    url: abs(s.path),
    serviceType: s.name,
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'Country', name: 'Zimbabwe' },
    ...(s.lowPriceCents
      ? { offers: { '@type': 'Offer', priceCurrency: 'USD', price: (s.lowPriceCents / 100).toFixed(2), priceSpecification: { '@type': 'PriceSpecification', minPrice: (s.lowPriceCents / 100).toFixed(2), priceCurrency: 'USD' } } }
      : {}),
  };
}

export function faqSchema(faqs: Faq[]) {
  return { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

/** Serialises a JSON-LD graph safely for a <script> tag (escapes "<" so content cannot close the tag). */
export function jsonLd(nodes: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}

/** Absolute WhatsApp link with a pre-filled message. */
export const whatsappLink = (message: string) => `${COMPANY.whatsappHref}?text=${encodeURIComponent(message)}`;
