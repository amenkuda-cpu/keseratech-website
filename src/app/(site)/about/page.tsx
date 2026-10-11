import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY, DIVISIONS, STATUS_STAGE } from '@/content/site';
import { listProjects } from '@/lib/db';
import { Cta, Dot, Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { ProcessPipeline } from '@/components/home/process-pipeline';

export const metadata: Metadata = {
  title: { absolute: 'About Kesera Technologies | Zimbabwe Tech Company' },
  alternates: { canonical: '/about' },
  description: 'Kesera Technologies Holdings is developing practical technology across software, AI, agriculture, energy and smart living.',
};

const VERBS = [
  { word: 'Developing', text: 'Products of our own, in the open: BikerDash, smart irrigation and smart EV charging.' },
  { word: 'Engineering', text: 'Software, hardware and the systems that join them, designed for real conditions.' },
  { word: 'Testing', text: 'In the field and with real people, before anything is called finished.' },
  { word: 'Building', text: 'Websites, apps and software for businesses, and homes, furniture and facilities from reclaimed materials.' },
];

export default async function AboutPage() {
  const ventures = (await listProjects()).filter((p) => p.kind === 'venture');
  const markers = Object.entries(
    ventures.reduce<Record<string, string[]>>((acc, p) => {
      (acc[STATUS_STAGE[p.status]] ??= []).push(p.name);
      return acc;
    }, {}),
  ).map(([stage, names]) => ({ stage, names }));

  return (
    <>
      <section className="shell pb-20 pt-[calc(68px+3.5rem)] md:pb-28 md:pt-[calc(68px+6rem)]" aria-labelledby="about-title">
        <Label>About Kesera</Label>
        <MaskLines id="about-title" as="h1" immediate className="t-display-xl mt-8 text-[clamp(2.4rem,7.2vw,7.4rem)]" lines={['We build for', 'the world ahead.']} />
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <p className="t-lead text-white md:col-span-6">
            {COMPANY.legal} is a technology and engineering company developing practical solutions across software, artificial intelligence, agriculture, energy and smart living, and building sustainable homes from recycled, reused and upcycled materials.
          </p>
          <p className="t-body text-dim md:col-span-5 md:col-start-8">
            We would rather show work than make claims. Our own products are in development, and we say so. Sera Tech builds for clients today. When something is launched, piloted or proven, you will read about it here, with the evidence.
          </p>
        </div>
      </section>

      <section className="border-t border-hair" aria-label="What we do">
        <ul className="shell grid md:grid-cols-2 lg:grid-cols-4">
          {VERBS.map((v, i) => (
            <Reveal key={v.word} as="li" delay={i * 0.06} className="border-b border-hair py-10 md:px-6 md:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <p className="t-display-m text-[clamp(1.5rem,2.2vw,2.1rem)]">{v.word}.</p>
              <p className="mt-5 text-sm leading-relaxed text-dim">{v.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="section border-t border-hair" aria-labelledby="structure-title">
        <div className="shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Label index="01">Structure</Label>
            <h2 id="structure-title" className="t-display-m mt-10">One holding company. Six divisions.</h2>
            <p className="t-body mt-6 text-dim">Each division focuses on one industry. They share engineers, standards and technology, so what one learns, all of them use.</p>
          </div>
          <ul className="md:col-span-6 md:col-start-7">
            {DIVISIONS.map((d) => (
              <li key={d.slug} className="border-t border-hair last:border-b">
                <Link href={`/${d.slug}`} className="flex items-center justify-between gap-6 py-5 transition-colors hover:text-signal-soft">
                  <span className="flex items-center gap-4">
                    <Dot color={d.accent} size={8} />
                    <span className="t-title text-[1.15rem]">{d.name}</span>
                  </span>
                  <span className="t-label text-faint">{d.discipline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProcessPipeline markers={markers} index="02" />

      <section className="section border-t border-hair" aria-labelledby="contact-title">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index="03">Contact</Label>
            <h2 id="contact-title" className="t-display-l mt-10">Talk to us.</h2>
          </div>
          <div className="space-y-3 md:col-span-5">
            <a className="t-title block text-[1.2rem] normal-case hover:text-signal-soft" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            <a className="t-title block text-[1.2rem] normal-case hover:text-signal-soft" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            <div className="pt-6"><Cta href="/start">Start a project</Cta></div>
          </div>
        </div>
      </section>
    </>
  );
}
