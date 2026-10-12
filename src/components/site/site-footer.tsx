import Link from 'next/link';
import { COMPANY, DIVISIONS, VENTURE_NAMES } from '@/content/site';
import { Cta, Dot, HorizonLine } from '@/components/system/primitives';
import { Logo } from './logo';

const COLUMNS = [
  {
    title: 'Divisions',
    links: DIVISIONS.map((d) => ({ href: `/${d.slug}`, label: d.name, accent: d.accent })),
  },
  {
    title: 'Services',
    links: [
      { href: '/start?service=website', label: 'Website development' },
      { href: '/start?service=app', label: 'App development' },
      { href: '/start?service=software', label: 'Software development' },
      { href: '/start?service=automation', label: 'AI & automation' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Projects',
    links: [
      { href: '/projects/pocketjobs', label: 'PocketJobs' },
      { href: '/projects/bikerdash', label: VENTURE_NAMES.delivery },
      { href: '/projects/smart-irrigation', label: 'Smart Irrigation' },
      { href: '/projects/smart-ev-charging', label: 'Smart EV Charging' },
      { href: '/projects', label: 'All projects' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hair bg-void pt-24 md:pt-32">
      <div className="shell">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo tagline className="w-[260px] md:w-[320px]" />
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-dim">
              {COMPANY.legal}. Software, artificial intelligence, agriculture, energy and sustainable building from reclaimed materials, developed in {COMPANY.country}.
            </p>
            <div className="mt-8">
              <Cta href="/start">Start a project</Cta>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4 lg:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="t-label text-faint">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-white">
                        {'accent' in l && <Dot color={l.accent} size={5} />}
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="t-label text-faint">Contact</p>
              <ul className="mt-5 space-y-3 text-sm text-dim">
                <li><a className="transition-colors hover:text-white" href={`https://${COMPANY.website}`}>{COMPANY.website}</a></li>
                <li><a className="break-all transition-colors hover:text-white" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
                <li><a className="transition-colors hover:text-white" href={COMPANY.phoneHref}>{COMPANY.phone}</a></li>
                <li><a className="transition-colors hover:text-white" href={COMPANY.whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-24 md:mt-32">
        <HorizonLine />
        <div className="shell">
          <p
            aria-hidden
            className="t-display-xl select-none whitespace-nowrap pt-10 pb-6 text-center text-[clamp(2.6rem,14vw,14rem)] leading-[0.8] text-white/[0.06]"
          >
            Kesera
          </p>
        </div>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-hair py-8 text-xs text-faint md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {COMPANY.legal}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li><Link className="hover:text-white" href="/legal/privacy">Privacy</Link></li>
          <li><Link className="hover:text-white" href="/legal/terms">Terms</Link></li>
          <li><Link className="hover:text-white" href="/about">About</Link></li>
        </ul>
      </div>
    </footer>
  );
}
