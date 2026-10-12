import type { Project } from '@/lib/db';
import { cn } from '@/lib/utils';

// Download buttons for finished apps. Outbound links open the official store listings.

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-current">
      <path d="M16.37 12.65c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.35 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.1 5.88c.63-.77 1.06-1.83.94-2.88-.91.04-2.01.6-2.66 1.37-.58.67-1.09 1.75-.95 2.78 1.01.08 2.04-.51 2.67-1.27z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6">
      <path d="M3.6 2.2c-.2.2-.3.6-.3 1v17.6c0 .4.1.8.3 1l9.9-9.8z" fill="#00d7fe" />
      <path d="M16.8 15.3l-3.3-3.3 3.3-3.3 3.8 2.2c1.1.6 1.1 1.6 0 2.2z" fill="#ffce00" />
      <path d="M16.8 15.3L13.5 12l-9.9 9.8c.4.4 1 .4 1.7 0z" fill="#ff3a44" />
      <path d="M16.8 8.7L5.3 2.2c-.7-.4-1.3-.4-1.7 0l9.9 9.8z" fill="#00f076" />
    </svg>
  );
}

const base =
  'inline-flex min-h-12 items-center gap-3 rounded-[8px] border border-white/25 bg-black px-4 text-white transition-colors hover:border-white/60 hover:bg-white/[0.06] focus-visible:outline-2';

export function StoreButtons({ links, name, className }: { links: Project['links']; name: string; className?: string }) {
  if (!links?.appStore && !links?.googlePlay) return null;
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {links.appStore && (
        <a href={links.appStore} target="_blank" rel="noreferrer" className={base} aria-label={`Download ${name} on the App Store`}>
          <AppleIcon />
          <span className="text-left leading-none">
            <span className="block text-[0.62rem] tracking-wide text-white/70">Download on the</span>
            <span className="mt-1 block text-[1.05rem] font-semibold">App Store</span>
          </span>
        </a>
      )}
      {links.googlePlay && (
        <a href={links.googlePlay} target="_blank" rel="noreferrer" className={base} aria-label={`Get ${name} on Google Play`}>
          <PlayIcon />
          <span className="text-left leading-none">
            <span className="block text-[0.62rem] uppercase tracking-wide text-white/70">Get it on</span>
            <span className="mt-1 block text-[1.05rem] font-semibold">Google Play</span>
          </span>
        </a>
      )}
    </div>
  );
}
