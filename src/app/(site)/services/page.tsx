import { Breadcrumbs, JsonLd, LinkCards, WhatsAppBand } from '@/components/seo/blocks';
import { SERVICE_PAGES } from '@/content/seo/services';
import { breadcrumbSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Web Design, Apps & AI Services in Zimbabwe | Kesera',
  description: 'Websites, online stores, mobile apps, AI chatbots, AI receptionists, AI automation and CRM dashboards for Zimbabwean businesses, with clear prices.',
  path: '/services',
});

export default function ServicesPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ];
  return (
    <div className="paper pt-[68px]">
      <JsonLd nodes={[breadcrumbSchema(crumbs)]} />
      <section className="shell pb-16 pt-12 md:pb-20 md:pt-16" aria-labelledby="services-title">
        <Breadcrumbs crumbs={crumbs} />
        <p className="t-label mt-10 text-ink/55">Sera Tech · Services</p>
        <h1 id="services-title" className="t-display-l mt-5 max-w-[18ch]">
          Websites, apps and AI for Zimbabwean businesses.
        </h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/75">
          Everything we build is designed to win you customers or save you time. Pick a service to see what is included, what it costs and the questions business owners ask us most.
        </p>
      </section>
      <div className="shell space-y-20 pb-24 md:pb-36">
        <LinkCards title="Our services" links={SERVICE_PAGES.map((s) => ({ href: `/services/${s.slug}`, label: s.name, text: s.description }))} />
        <WhatsAppBand message="Hi Kesera, I would like to discuss a project." heading="Not sure which service you need?" />
      </div>
    </div>
  );
}
