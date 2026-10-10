import sources from './photo-sources.json';
import dimensions from './photo-dimensions.json';

// Real photographs. The reference photos are openly licensed examples of reuse from around the
// world, credited on the page. They are not Sera Home's own work, and the site says so.
// To add Sera Home's own photo: put it in public/photos/, add an entry to photo-sources.json
// with "ours": true (no licence needed), add its size to photo-dimensions.json (or rerun
// scripts/fetch-photos.mjs), and it is captioned as Sera Home's work.

export type PhotoCategory = 'containers' | 'drums' | 'furniture' | 'facilities' | 'building';

export type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  place: string;
  category: PhotoCategory;
  ours: boolean;
  credit?: string;
  license?: string;
  licenseUrl?: string;
  source?: string;
};

type Source = Omit<Photo, 'src' | 'width' | 'height' | 'ours'> & { ours?: boolean };
const dims = dimensions as Record<string, { width: number; height: number }>;

export const PHOTOS: Record<string, Photo> = Object.fromEntries(
  (sources as Source[]).map((s) => {
    const d = dims[s.id];
    if (!d) throw new Error(`Missing dimensions for photo ${s.id}; run scripts/fetch-photos.mjs`);
    return [s.id, { ...s, ours: !!s.ours, src: `/photos/${s.id}.jpg`, width: d.width, height: d.height }];
  }),
);

export const photo = (id: string): Photo => {
  const p = PHOTOS[id];
  if (!p) throw new Error(`Unknown photo ${id}`);
  return p;
};

export const PHOTO_CATEGORIES: { id: PhotoCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'containers', label: 'Shipping containers' },
  { id: 'drums', label: 'Oil drums' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'facilities', label: 'Handwashing' },
  { id: 'building', label: 'Recycled building' },
];
