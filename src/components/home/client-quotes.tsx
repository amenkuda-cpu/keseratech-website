import { Label } from '@/components/system/primitives';
import { Reveal } from '@/components/system/motion';
import { SHOW_PLACEHOLDERS, visibleQuotes } from '@/content/people';
import { PlaceholderTag } from '@/components/site/people';

// What clients say. Placeholder quotes never appear on the live site (see src/content/people.ts).

export function ClientQuotes() {
  const quotes = visibleQuotes();
  if (!quotes.length) return null;
  const [first, ...rest] = quotes;
  return (
    <section aria-labelledby="quotes-title" className="section">
      <div className="shell">
        <Label>
          <span id="quotes-title">In their words</span>
        </Label>
        <div className="mt-12 grid gap-14 lg:grid-cols-12">
          {/* One big quote, the rest smaller and offset */}
          <Reveal as="figure" className="lg:col-span-7">
            <blockquote className="t-display-m">“{first!.quote}”</blockquote>
            <figcaption className="mt-6 text-white/70">
              {first!.name}, {first!.business}
              <PlaceholderTag show={SHOW_PLACEHOLDERS && first!.placeholder} />
            </figcaption>
          </Reveal>
          <div className="space-y-12 lg:col-span-4 lg:col-start-9 lg:mt-32">
            {rest.map((q, i) => (
              <Reveal key={i} as="figure" delay={0.1 * (i + 1)} className="border-l border-hair-strong pl-6">
                <blockquote className="t-lead text-white/90">“{q.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-white/60">
                  {q.name}, {q.business}
                  <PlaceholderTag show={SHOW_PLACEHOLDERS && q.placeholder} />
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
