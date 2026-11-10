import { MediaFrame } from '@/components/visuals/media';
import { media } from '@/content/media';

// A full-bleed photograph with one quiet line over it: a pause between busier sections.

export function PhotoBand({ id, line }: { id: string; line: string }) {
  return (
    <section aria-label="Photograph" className="relative">
      <MediaFrame media={media(id)} aspect="auto" rounded={false} className="h-[62svh] min-h-[22rem] w-full md:h-[78svh]" sizes="100vw" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-8 md:bottom-14">
        <p className="shell t-display-m text-white">
          <span className="block max-w-[22ch]">{line}</span>
        </p>
      </div>
    </section>
  );
}
