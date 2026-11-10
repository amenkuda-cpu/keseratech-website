// Clips played behind the home page hero, crossfading from one to the next. All show real people at work.
// builder / wind-engineer: Mixkit (Mixkit Stock Video Free License), built by scripts/showcase-media.mjs.
// team-laptop: Pexels (listed in src/content/media-sources.json), built by scripts/fetch-media.mjs.
// The first clip's still frame is the poster shown on slow connections and with reduced motion.

export type ShowcaseSlide = { id: string; alt: string; video: string; poster: string };

export const SHOWCASE: ShowcaseSlide[] = [
  { id: 'team-laptop', alt: 'Three colleagues around a laptop, one typing while the others read along', video: '/media/team-laptop.mp4', poster: '/media/team-laptop.webp' },
  { id: 'builder', alt: 'A smiling construction worker in a red hard hat with his team behind him', video: '/showcase/builder.mp4', poster: '/showcase/builder.webp' },
  { id: 'wind-engineer', alt: 'An engineer with a tablet checking wind turbines', video: '/showcase/wind-engineer.mp4', poster: '/showcase/wind-engineer.webp' },
];
