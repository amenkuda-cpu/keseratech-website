import { Label } from '@/components/system/primitives';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="shell pb-28 pt-[calc(68px+3.5rem)] md:pt-[calc(68px+5rem)]">
      <Label>Legal</Label>
      <h1 className="t-display-l mt-8">{title}</h1>
      <p className="t-label mt-6 text-faint">Last updated {updated}</p>
      <div className="mt-14 max-w-3xl space-y-6 text-[1.02rem] leading-relaxed text-white/80 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </article>
  );
}
