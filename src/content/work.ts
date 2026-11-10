// Projects shown on the private portfolio page (/work).
//
// TO ADD A PROJECT: copy one entry and change it.
// - video: a short screen recording in public/work/ (MP4, and WebM if you have it, under ~5 MB) plus a
//   poster image (the first frame, WebP or JPG). Leave `webm` out if you only have an MP4.
// - liveUrl: the public address, or null if the site is not live (the button is then hidden).
// - placeholder: true keeps the entry off the live site (it still shows locally and on preview links).
// The order here is the order on the page.

export type WorkProject = {
  name: string;
  /** One or two sentences: who the client is and what was built. */
  summary: string;
  tags: string[];
  video: { mp4: string; webm?: string; poster: string } | null;
  liveUrl: string | null;
  placeholder: boolean;
};

export const WORK: WorkProject[] = [
  {
    name: 'Naturo Wellness',
    summary:
      'An online shop for a Zimbabwean natural-drinks brand: wellness shots, maheu, herbal teas and juices. Customers can filter, order and pay by Paynow, EcoCash or cash on delivery, and the owner runs it all from a simple admin.',
    tags: ['E-commerce', 'Food & drink', 'Admin dashboard'],
    video: { mp4: '/work/naturo.mp4', webm: '/work/naturo.webm', poster: '/work/naturo-poster.webp' },
    liveUrl: 'https://naturo-wellness.netlify.app',
    placeholder: false,
  },
  {
    name: 'Waterberry Croft',
    summary:
      'A website and farm shop for a commercial farm in Mashonaland East, with a live harvest board, wholesale quotes and online payments. Behind it sits a farm-office admin for stock, orders and customers.',
    tags: ['E-commerce', 'Agriculture', 'Web app'],
    video: { mp4: '/work/waterberry.mp4', webm: '/work/waterberry.webm', poster: '/work/waterberry-poster.webp' },
    liveUrl: 'https://waterberry-croft.netlify.app',
    placeholder: false,
  },
  {
    name: 'Rebrim Investments',
    summary:
      'An online store for a gadget shop and Econet franchise in Mahusekwa: phones, solar and wearables, with search, compare and WhatsApp ordering, plus a full admin for products and orders.',
    tags: ['E-commerce', 'Retail', 'Admin dashboard'],
    video: { mp4: '/work/rebrim.mp4', webm: '/work/rebrim.webm', poster: '/work/rebrim-poster.webp' },
    liveUrl: null,
    placeholder: false,
  },
  {
    name: 'Your next project',
    summary: 'Placeholder. Add another project here: who the client is, and what you built for them in a sentence or two.',
    tags: ['Corporate'],
    video: null,
    liveUrl: null,
    placeholder: true,
  },
];
