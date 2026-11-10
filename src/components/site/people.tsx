import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PersonPhoto } from '@/content/people';

/** A person's photo, or a clearly marked empty frame waiting for one. */
export function PersonFrame({ photo, label, className, sizes = '(min-width: 1024px) 40vw, 100vw' }: { photo: PersonPhoto; label: string; className?: string; sizes?: string }) {
  if (photo) {
    return (
      <div className={cn('relative overflow-hidden rounded-[6px] bg-deep', className)}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={cn('relative grid place-items-center rounded-[6px] border border-dashed border-white/25 bg-deep p-6 text-center', className)}>
      <div>
        <p className="t-label text-[#e8b26a]">Placeholder</p>
        <p className="mt-2 text-sm text-white/70">{label}</p>
        <p className="mt-1 text-xs text-white/40">Add it in src/content/people.ts</p>
      </div>
    </div>
  );
}

/** Small tag on placeholder text, so it can't be mistaken for the real thing. */
export function PlaceholderTag({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="t-label ml-2 rounded-sm bg-[#e8b26a] px-1.5 py-0.5 text-[0.6rem] text-black">Placeholder</span>;
}
