import { Breadcrumbs, JsonLd, LinkCards, WhatsAppBand } from '@/components/seo/blocks';
import { LOCATION_PAGES } from '@/content/seo/locations';
import { breadcrumbSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Where We Work: Harare, Marondera, Bulawayo | Kesera',
  description: 'Kesera Technologies is based in Marondera and builds websites, apps and AI for businesses in Harare, Bulawayo and across Zimbabwe.',
  path: '/locations',
});

export default function LocationsPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
  ];
  return (
    <div className="paper pt-[68px]">
      <JsonLd nodes={[breadcrumbSchema(crumbs)]} />
      <section className="shell pb-16 pt-12 md:pb-20 md:pt-16" aria-labelledby="locations-title">
        <Breadcrumbs crumbs={crumbs} />
        <p className="t-label mt-10 text-ink/55">Locations</p>
        <h1 id="locations-title" className="t-display-l mt-5 max-w-[18ch]">
          Based in Marondera. Working across Zimbabwe.
        </h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/75">
          We meet Marondera clients face to face and run projects everywhere else over WhatsApp, calls and video, with the same prices and the same team.
        </p>
      </section>
      <div className="shell space-y-20 pb-24 md:pb-36">
        <LinkCards title="Choose your area" links={LOCATION_PAGES.map((l) => ({ href: `/locations/${l.slug}`, label: l.slug === 'zimbabwe' ? 'All of Zimbabwe' : l.place, text: l.description }))} />
        <WhatsAppBand message="Hi Kesera, I would like to discuss a project." heading="Wherever you are, let's talk." />
      </div>
    </div>
  );
}
