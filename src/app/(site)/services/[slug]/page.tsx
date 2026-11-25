import { notFound } from 'next/navigation';
import { PlanTable } from '@/components/commercial/plan-table';
import { Breadcrumbs, FaqList, JsonLd, LinkCards, Sections, WhatsAppBand } from '@/components/seo/blocks';
import { Cta, Label } from '@/components/system/primitives';
import { LOCATION_PAGES } from '@/content/seo/locations';
import { SERVICE_PAGES, servicePage } from '@/content/seo/services';
import { getPlans } from '@/lib/db';
import { breadcrumbSchema, faqSchema, serviceSchema, whatsappLink } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/services/[slug]'>) {
  const s = servicePage((await params).slug);
  if (!s) return {};
  return pageMetadata({ title: s.title, description: s.description, path: `/services/${s.slug}` });
}

export default async function ServicePage({ params }: PageProps<'/services/[slug]'>) {
  const s = servicePage((await params).slug);
  if (!s) notFound();
  const path = `/services/${s.slug}`;
  const all = await getPlans();
  const plans = s.plans ? all.filter((p) => p.group === s.plans!.group && (!s.plans!.ids || s.plans!.ids.includes(p.id))).sort((a, b) => a.sort - b.sort) : [];
  const lowPrice = plans.length ? Math.min(...plans.map((p) => p.priceCents)) : null;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: s.name, path },
  ];
  const related = s.related.map((slug) => servicePage(slug)!).filter(Boolean);

  return (
    <div className="paper pt-[68px]">
      <JsonLd nodes={[serviceSchema({ name: s.name, description: s.description, path, lowPriceCents: lowPrice }), faqSchema(s.faqs), breadcrumbSchema(crumbs)]} />

      <section className="shell pb-16 pt-12 md:pb-24 md:pt-16" aria-labelledby="service-title">
        <Breadcrumbs crumbs={crumbs} />
        <p className="t-label mt-10 text-ink/55">{s.eyebrow}</p>
        <h1 id="service-title" className="t-display-l mt-5 max-w-[20ch]">
          {s.h1}
        </h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/75">{s.lead}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Cta href={whatsappLink(s.whatsapp)} external>
            Chat on WhatsApp
          </Cta>
          <Cta href={s.startHref} variant="ink">
            Get an estimate
          </Cta>
        </div>
      </section>

      <div className="shell pb-20 md:pb-28">
        <Sections sections={s.sections} />
      </div>

      <section id="prices" className="shell scroll-mt-24 pb-20 md:pb-28" aria-labelledby="prices-title">
        <Label index="01">Prices</Label>
        <h2 id="prices-title" className="t-display-m mt-5">
          {s.name} prices
        </h2>
        <p className="mt-4 max-w-2xl text-ink/70">{s.priceNote}</p>
        {plans.length > 0 && <PlanTable plans={plans} className="mt-10" />}
        {!s.plans && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Cta href="/ai-workforce" variant="ink">
              Meet the AI Workforce
            </Cta>
            <Cta href={s.startHref} variant="ink">
              Describe your workflow
            </Cta>
          </div>
        )}
      </section>

      <div className="shell space-y-20 pb-24 md:space-y-28 md:pb-36">
        <FaqList faqs={s.faqs} index="02" />
        <LinkCards title="Related services" links={related.map((r) => ({ href: `/services/${r.slug}`, label: r.name, text: r.description }))} />
        <LinkCards
          title="Where we work"
          links={LOCATION_PAGES.map((l) => ({ href: `/locations/${l.slug}`, label: l.slug === 'zimbabwe' ? 'All of Zimbabwe' : l.place, text: l.description }))}
        />
        <WhatsAppBand message={s.whatsapp} heading={`Ready to talk about your ${s.name.toLowerCase()}?`} startHref={s.startHref} />
      </div>
    </div>
  );
}
