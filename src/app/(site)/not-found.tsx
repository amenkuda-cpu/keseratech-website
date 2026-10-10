import { Cta } from '@/components/system/primitives';

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-center pt-[68px]">
      <p className="t-label text-faint">404</p>
      <h1 className="t-display-l mt-6 max-w-[14ch]">Not built yet.</h1>
      <p className="t-lead mt-6 max-w-lg text-dim">This page doesn’t exist. Perhaps it’s still in research.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Cta href="/">Back to Kesera</Cta>
        <Cta href="/projects" variant="ghost">See our projects</Cta>
      </div>
    </section>
  );
}
