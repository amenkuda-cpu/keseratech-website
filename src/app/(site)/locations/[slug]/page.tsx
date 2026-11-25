import { notFound } from 'next/navigation';
import { Breadcrumbs, FaqList, JsonLd, LinkCards, Sections, WhatsAppBand } from '@/components/seo/blocks';
import { Cta } from '@/components/system/primitives';
import { LOCATION_PAGES, locationPage } from '@/content/seo/locations';
import { servicePage } from '@/content/seo/services';
import { BUSINESS_ID, abs, breadcrumbSchema, faqSchema, whatsappLink } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return LOCATION_PAGES.map((l) => ({ slug: l.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/locations/[slug]'>) {
  const l = locationPage((await params).slug);
  if (!l) return {};
  return pageMetadata({ title: l.title, description: l.description, path: `/locations/${l.slug}` });
}

export default async function LocationPage({ params }: PageProps<'/locations/[slug]'>) {
  const l = locationPage((await params).slug);
  if (!l) notFound();
  const path = `/locations/${l.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: l.place, path },
  ];
  const services = l.services.map((slug) => servicePage(slug)!).filter(Boolean);
  // The page describes the business serving this place; it does not claim a branch there.
  const servesHere = {
    '@type': 'WebPage',
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name: l.title,
    about: { '@id': BUSINESS_ID },
    spatialCoverage: { '@type': l.slug === 'zimbabwe' ? 'Country' : 'City', name: l.place, ...(l.slug === 'zimbabwe' ? {} : { containedInPlace: { '@type': 'Country', name: 'Zimbabwe' } }) },
  };

  return (
    <div className="paper pt-[68px]">
      <JsonLd nodes={[servesHere, faqSchema(l.faqs), breadcrumbSchema(crumbs)]} />
      <section className="shell pb-16 pt-12 md:pb-24 md:pt-16" aria-labelledby="location-title">
        <Breadcrumbs crumbs={crumbs} />
        <p className="t-label mt-10 text-ink/55">{l.eyebrow}</p>
        <h1 id="location-title" className="t-display-l mt-5 max-w-[20ch]">
          {l.h1}
        </h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/75">{l.lead}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Cta href={whatsappLink(l.whatsapp)} external>
            Chat on WhatsApp
          </Cta>
          <Cta href="/pricing" variant="ink">
            See prices
          </Cta>
        </div>
      </section>
      <div className="shell space-y-20 pb-24 md:space-y-28 md:pb-36">
        <Sections sections={l.sections} />
        <LinkCards title={`Popular services in ${l.place}`} links={services.map((s) => ({ href: `/services/${s.slug}`, label: s.name, text: s.description }))} />
        <LinkCards title="Recent work" links={[{ href: '/work', label: 'See our work', text: 'Online stores, company websites, a law firm, a church and the PocketJobs app.' }]} />
        <FaqList faqs={l.faqs} />
        <WhatsAppBand message={l.whatsapp} heading={`Let's build something for your ${l.slug === 'zimbabwe' ? '' : `${l.place} `}business.`} />
      </div>
    </div>
  );
}
