import Link from 'next/link';
import { Cta } from '@/components/system/primitives';

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-center pt-[68px]">
      <p className="t-label text-faint">404</p>
      <h1 className="t-display-l mt-6 max-w-[14ch]">Not built yet.</h1>
      <p className="t-lead mt-6 max-w-lg text-dim">This page doesn’t exist. Perhaps it’s still in research.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Cta href="/">Back to Kesera</Cta>
        <Cta href="/services" variant="ghost">See our services</Cta>
      </div>
      <nav aria-label="Popular pages" className="mt-12">
        <p className="t-label text-faint">Popular pages</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-dim">
          <li><Link className="underline-offset-4 hover:text-white hover:underline" href="/services/website-design-zimbabwe">Website design</Link></li>
          <li><Link className="underline-offset-4 hover:text-white hover:underline" href="/pricing">Prices</Link></li>
          <li><Link className="underline-offset-4 hover:text-white hover:underline" href="/work">Our work</Link></li>
          <li><Link className="underline-offset-4 hover:text-white hover:underline" href="/ai-workforce">AI Workforce</Link></li>
          <li><Link className="underline-offset-4 hover:text-white hover:underline" href="/blog">Blog</Link></li>
          <li><Link className="underline-offset-4 hover:text-white hover:underline" href="/start">Get a quote</Link></li>
        </ul>
      </nav>
    </section>
  );
}
