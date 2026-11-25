import { COMPANY, DIVISIONS } from '@/content/site';
import { SERVICE_PAGES } from '@/content/seo/services';
import { INSTAGRAM_URL, ORG_ID, SITE_URL, abs, jsonLd, localBusinessSchema } from '@/lib/schema';

// Company details for search engines (schema.org JSON-LD) on the home page: the organisation, its
// local business listing (Marondera, serving all of Zimbabwe), the website and its services.
export function OrganizationJsonLd() {
  const phone = COMPANY.phone.replace(/\s/g, '');
  const nodes = [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Kesera Technologies',
      legalName: COMPANY.legal,
      slogan: 'Intelligence. Automation. Evolution.',
      url: SITE_URL,
      logo: abs('/brand/kesera-lockup.png'),
      email: COMPANY.email,
      telephone: phone,
      sameAs: [INSTAGRAM_URL],
      address: { '@type': 'PostalAddress', addressLocality: 'Marondera', addressRegion: 'Mashonaland East', addressCountry: 'ZW' },
      areaServed: { '@type': 'Country', name: 'Zimbabwe' },
      description:
        'Zimbabwean technology company building websites, online stores, mobile apps, AI chatbots, AI receptionists and business software, and developing agricultural, energy and sustainable building technology.',
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: COMPANY.email, telephone: phone, areaServed: 'ZW', availableLanguage: ['en'] }],
      department: DIVISIONS.map((d) => ({ '@type': 'Organization', name: d.name, url: abs(`/${d.slug}`), description: d.short })),
    },
    {
      ...localBusinessSchema(),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: SERVICE_PAGES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: abs(`/services/${s.slug}`) } })),
      },
    },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'Kesera Technologies', publisher: { '@id': ORG_ID }, inLanguage: 'en' },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(nodes) }} />;
}
