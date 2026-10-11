// Home page showcase. Files are built by scripts/showcase-media.mjs from Mixkit originals
// (Mixkit Stock Video Free License: free for commercial use, no attribution or watermark).
// Played behind the home page hero, crossfading from one clip to the next.

/** seconds: clip length, as cut by scripts/showcase-media.mjs */
export type ShowcaseSlide = { id: string; seconds: number; caption: string; theme: string; alt: string };

export const SHOWCASE: ShowcaseSlide[] = [
  { id: 'robot-arm', seconds: 7, theme: 'Robotics', caption: 'Automation that does the heavy lifting', alt: 'An orange industrial robot arm working on an electronics production line' },
  { id: 'builder', seconds: 6.8, theme: 'Work', caption: 'Built by skilled hands', alt: 'A smiling construction worker in a red hard hat with his team behind him' },
  { id: 'wind-engineer', seconds: 7, theme: 'Energy', caption: 'Clean power, engineered', alt: 'An engineer with a tablet checking wind turbines' },
  { id: 'robot-planting', seconds: 7, theme: 'Agriculture', caption: 'Smarter farming, from seedling up', alt: 'A robot planting young seedlings in a greenhouse' },
];

export const showcaseSrc = (id: string) => ({ video: `/showcase/${id}.mp4`, poster: `/showcase/${id}.webp` });
