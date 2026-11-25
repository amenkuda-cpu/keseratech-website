import Link from 'next/link';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { Cta, Label } from '@/components/system/primitives';
import { jsonLd, whatsappLink, type Crumb } from '@/lib/schema';
import type { Faq, SeoSection } from '@/content/seo/types';
import { COMPANY } from '@/content/site';

// Building blocks for the search-focused pages (services, locations, blog), in the light "paper"
// chapter style used by /pricing so they sit naturally in the existing design.

export function JsonLd({ nodes }: { nodes: object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(nodes) }} />;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="t-label text-ink/55">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="underline-offset-4 hover:text-ink hover:underline">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink/80">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Long-form sections: H2, paragraphs, optional bullet list and H3 sub-points. */
export function Sections({ sections }: { sections: SeoSection[] }) {
  return (
    <div className="space-y-14 md:space-y-16">
      {sections.map((s) => (
        <section key={s.h2} className="max-w-3xl">
          <h2 className="t-display-m text-[clamp(1.6rem,3.4vw,2.3rem)]">{s.h2}</h2>
          <div className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-ink/75">
            {s.body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {s.bullets && (
            <ul className="mt-5 space-y-2.5 text-[1.02rem] text-ink/80">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-signal" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {s.points && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.points.map((pt) => (
                <div key={pt.h3} className="rounded-[12px] border border-ink/12 bg-white/70 p-5">
                  <h3 className="text-[1.05rem] font-semibold text-ink">{pt.h3}</h3>
                  <p className="mt-2 text-[0.97rem] leading-relaxed text-ink/70">{pt.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export function FaqList({ faqs, index }: { faqs: Faq[]; index?: string }) {
  return (
    <section aria-labelledby="faq-title" className="max-w-3xl">
      <Label index={index}>FAQ</Label>
      <h2 id="faq-title" className="t-display-m mt-5 text-[clamp(1.6rem,3.4vw,2.3rem)]">
        Questions we get asked
      </h2>
      <div className="mt-8 divide-y divide-ink/12 border-y border-ink/12">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 text-[1.05rem] font-semibold text-ink">
              <h3>{f.q}</h3>
              <span aria-hidden className="text-xl text-ink/50 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink/70">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** The closing call to action on every search page: WhatsApp first, the project form second. */
export function WhatsAppBand({ message, heading, startHref = '/start' }: { message: string; heading: string; startHref?: string }) {
  return (
    <section aria-labelledby="cta-title" className="rounded-[16px] bg-ink p-8 text-white md:p-12">
      <h2 id="cta-title" className="t-display-m max-w-[22ch] text-[clamp(1.7rem,3.6vw,2.6rem)]">
        {heading}
      </h2>
      <p className="mt-4 max-w-xl text-white/75">Message us on WhatsApp for a quick answer, or send your project details and get an estimate in minutes.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Cta href={whatsappLink(message)} external>
          Chat on WhatsApp
        </Cta>
        {/* Inside .paper the ghost button's text colour is dark, so set it for this dark band. */}
        <Cta href={startHref} variant="ghost" className="border-white/30! text-white! hover:border-white/60!">
          Get an estimate
        </Cta>
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-white/60">
        <MessageCircle aria-hidden className="size-4" /> {COMPANY.phone} · {COMPANY.email}
      </p>
    </section>
  );
}

/** Internal links to related pages, shown as simple cards. */
export function LinkCards({ title, links }: { title: string; links: { href: string; label: string; text: string }[] }) {
  return (
    <section aria-label={title}>
      <h2 className="t-label text-ink/55">{title}</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="lift group flex h-full flex-col rounded-[12px] border border-ink/12 bg-white/70 p-5 hover:border-ink/30">
              <span className="font-semibold text-ink group-hover:text-signal">{l.label} →</span>
              <span className="mt-2 text-sm leading-relaxed text-ink/65">{l.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
