import { COMPANY, DIVISIONS } from '@/content/site';

// Company details for search engines (schema.org JSON-LD): name, logo, contact, location, services.
export function OrganizationJsonLd() {
  const url = process.env.SITE_URL ?? `https://${COMPANY.website}`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: 'Kesera Technologies',
        legalName: COMPANY.legal,
        url,
        logo: `${url}/brand/kesera-lockup.png`,
        email: COMPANY.email,
        telephone: COMPANY.phone.replace(/\s/g, ''),
        address: { '@type': 'PostalAddress', addressCountry: 'ZW' },
        areaServed: ['ZW', 'Africa'],
        description:
          'Zimbabwean technology company building websites, mobile apps and custom software, and developing AI, agricultural, energy and sustainable building technology.',
        contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: COMPANY.email, telephone: COMPANY.phone.replace(/\s/g, ''), areaServed: 'ZW', availableLanguage: ['en'] }],
        department: DIVISIONS.map((d) => ({ '@type': 'Organization', name: d.name, url: `${url}/${d.slug}`, description: d.short })),
        makesOffer: ['Website development', 'Mobile app development', 'Custom software development', 'AI assistants and automation'].map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name, areaServed: 'ZW' },
        })),
      },
      { '@type': 'WebSite', '@id': `${url}/#website`, url, name: 'Kesera Technologies', publisher: { '@id': `${url}/#organization` }, inLanguage: 'en' },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }} />;
}
