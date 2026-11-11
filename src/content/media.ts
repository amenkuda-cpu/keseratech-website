import sources from './media-sources.json';
import dimensions from './media-dimensions.json';

// Stock photographs and short video loops from Pexels (free for commercial use, no attribution
// required: https://www.pexels.com/license/). They illustrate each subject; they are not photos of
// Kesera's own projects. Licence records (source page and photographer) live in media-sources.json
// and docs/MEDIA_LICENSES.md. To add or swap one: edit media-sources.json, run
// `node scripts/fetch-media.mjs`, then reference it here by id.

export type Media = {
  id: string;
  kind: 'photo' | 'video';
  /** WebP image (photos) or the poster frame (videos) */
  src: string;
  /** MP4 loop, videos only */
  video?: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, keeps the subject in frame when cropped */
  focus: string;
  credit: string;
  creditUrl: string;
  source: string;
};

type Source = { id: string; kind: 'photo' | 'video'; alt: string; focus?: string; credit: string; creditUrl: string; source: string };
const dims = dimensions as Record<string, { width: number; height: number }>;

export const MEDIA: Record<string, Media> = Object.fromEntries(
  (sources as Source[]).map((s) => {
    const d = dims[s.id];
    if (!d) throw new Error(`Missing dimensions for media ${s.id}; run scripts/fetch-media.mjs`);
    return [
      s.id,
      {
        id: s.id,
        kind: s.kind,
        src: `/media/${s.id}.webp`,
        video: s.kind === 'video' ? `/media/${s.id}.mp4` : undefined,
        width: d.width,
        height: d.height,
        alt: s.alt,
        focus: s.focus ?? '50% 50%',
        credit: s.credit,
        creditUrl: s.creditUrl,
        source: s.source,
      },
    ];
  }),
);

export const media = (id: string): Media => {
  const m = MEDIA[id];
  if (!m) throw new Error(`Unknown media ${id}`);
  return m;
};

/** One image per division: division page heroes and the home page index. */
export const DIVISION_MEDIA: Record<string, string> = {
  'sera-tech': 'developer-nairobi',
  agrisera: 'farmer-irrigating',
  'sera-energy': 'ev-plug',
  'sera-home': 'container-home',
  'sera-assistants': 'owner-phone',
  'sera-front-desk': 'call-agent',
};

/** Per project visual: a still for cards and showcases, and an optional loop for detail pages. */
export const PROJECT_MEDIA: Record<string, { still: string; loop?: string }> = {
  marketplace: { still: 'tradesperson' },
  delivery: { still: 'delivery-night' },
  irrigation: { still: 'farmer-irrigating', loop: 'irrigation-sprinklers' },
  ev: { still: 'ev-plug', loop: 'ev-charging' },
  upcycle: { still: 'container-home' },
  home: { still: 'solar-technicians' },
};
