// Home page showcase. Files are built by scripts/showcase-media.mjs from Mixkit originals
// (Mixkit Stock Video Free License: free for commercial use, no attribution or watermark).
// Order tells the story: families and children, the people who build, and the technology.

/** seconds: clip length, as cut by scripts/showcase-media.mjs */
export type ShowcaseSlide = { id: string; seconds: number; caption: string; theme: string; alt: string };

export const SHOWCASE: ShowcaseSlide[] = [
  { id: 'family-baking', seconds: 6.9, theme: 'Family', caption: 'Moments worth building for', alt: 'A mother and daughter laughing as they show off cookies they baked together' },
  { id: 'fishermen', seconds: 7.5, theme: 'Work', caption: 'People at work, proud of it', alt: 'Fishermen celebrating on a wooden boat at sea' },
  { id: 'robotics-class', seconds: 7.5, theme: 'Learning', caption: 'The next generation of engineers', alt: 'A teacher showing children how a robotic hand works' },
  { id: 'robot-arm', seconds: 7, theme: 'Robotics', caption: 'Automation that does the heavy lifting', alt: 'An orange industrial robot arm working on an electronics production line' },
  { id: 'father-son', seconds: 7, theme: 'Family', caption: 'Technology that brings people closer', alt: 'A father and his young son sharing popcorn in front of a laptop' },
  { id: 'builder', seconds: 6.8, theme: 'Work', caption: 'Built by skilled hands', alt: 'A smiling construction worker in a red hard hat with his team behind him' },
  { id: 'wind-engineer', seconds: 7, theme: 'Energy', caption: 'Clean power, engineered', alt: 'An engineer with a tablet checking wind turbines' },
  { id: 'drone-technician', seconds: 7, theme: 'Technology', caption: 'Technicians who make it work', alt: 'A technician repairing a drone at a workshop bench' },
  { id: 'robot-planting', seconds: 7, theme: 'Agriculture', caption: 'Smarter farming, from seedling up', alt: 'A robot planting young seedlings in a greenhouse' },
  { id: 'recycling-family', seconds: 7, theme: 'Home', caption: 'Nothing wasted, everything reused', alt: 'A father and son laughing as they sort recycling at home' },
];

export const showcaseSrc = (id: string) => ({ video: `/showcase/${id}.mp4`, poster: `/showcase/${id}.webp` });
