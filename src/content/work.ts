// Projects shown on the "Our Work" page (/work).
//
// TO ADD A PROJECT: copy one entry and change it.
// - video: a short screen recording in public/work/ (MP4, under ~5 MB) plus a poster image (WebP or JPG).
//   Recordings are made with "Websites Kesera Technologies/portfolio-clips/scripts/record-many.cjs".
// - liveUrl: the public address, or null if the site is not live (the button is then hidden).
// - moreLinks: extra links shown beside the main button (another country site, for example).
// - apps: App Store / Google Play links, shown as download buttons.
// - placeholder: true keeps the entry off the live site (it still shows locally and on preview links).
// The order here is the order on the page.

export type WorkProject = {
  name: string;
  /** One or two sentences: who the client is and what was built. */
  summary: string;
  tags: string[];
  video: { mp4: string; webm?: string; poster: string } | null;
  liveUrl: string | null;
  moreLinks?: { label: string; href: string }[];
  apps?: { appStore?: string; googlePlay?: string };
  placeholder: boolean;
};

const clip = (name: string) => ({ mp4: `/work/${name}.mp4`, poster: `/work/${name}-poster.webp` });

export const WORK: WorkProject[] = [
  {
    name: 'PocketJobs',
    summary:
      'Our own marketplace app, live on iPhone and Android. People across Zimbabwe post a job, get offers from verified local cleaners, plumbers, electricians and tutors, chat, track the provider and pay in cash.',
    tags: ['Mobile app', 'Marketplace', 'Website'],
    video: clip('pocketjobs'),
    liveUrl: 'https://pocketjobs.co',
    apps: {
      appStore: 'https://apps.apple.com/us/app/pocketjobs-co/id6791999235',
      googlePlay: 'https://play.google.com/store/apps/details?id=co.pocketjobs.app',
    },
    placeholder: false,
  },
  {
    name: 'Uptime Africa Group',
    summary:
      'The group website for an African technology company with two businesses: enterprise ICT and smart farming. It covers operations in Zimbabwe and Mozambique, in English and Portuguese.',
    tags: ['Corporate', 'Multi-country', 'Bilingual'],
    video: clip('uptime-africa'),
    liveUrl: 'https://uptime-africa.vercel.app',
    moreLinks: [{ label: 'Mozambique site', href: 'https://uptime-africa.vercel.app/mozambique/en' }],
    placeholder: false,
  },
  {
    name: 'Uptime Technologies Zimbabwe',
    summary:
      'An ICT company’s site for networking, cybersecurity, cloud and IT support in Zimbabwe. The hero assembles a laptop piece by piece as you scroll, and each of the twelve services has its own page.',
    tags: ['Corporate', 'ICT', 'Scroll animation'],
    video: clip('uptime-zimbabwe'),
    liveUrl: 'https://uptime-zimbabwe.vercel.app',
    placeholder: false,
  },
  {
    name: 'Ndoro Chambers',
    summary:
      'A website for a Zimbabwean law firm: its practice areas, from labour law and conveyancing to criminal and commercial work, the team, and a simple way to book a consultation.',
    tags: ['Professional services', 'Legal', 'Corporate'],
    video: clip('ndoro-chambers'),
    liveUrl: 'https://ndorochambers.com',
    placeholder: false,
  },
  {
    name: 'Naturo Wellness',
    summary:
      'An online shop for a Zimbabwean natural-drinks brand: wellness shots, traditional favourites, herbal teas and juices. Customers order and pay online, and the owner runs it all from a simple admin.',
    tags: ['E-commerce', 'Food & drink', 'Admin dashboard'],
    video: clip('naturo'),
    liveUrl: 'https://getnaturo.com',
    placeholder: false,
  },
  {
    name: 'Perfect Sip',
    summary:
      'A bright, playful site for a non-alcoholic drinks bar in Zimbabwe: juices, smoothies and mocktails, with an online menu, ordering on WhatsApp and event bookings.',
    tags: ['Food & drink', 'Ordering', 'Bookings'],
    video: clip('perfect-sip'),
    liveUrl: 'https://perfect-sip-coral.vercel.app',
    placeholder: false,
  },
  {
    name: 'House of John Cash',
    summary:
      'A dark, cinematic brand site for a wines and spirits house: blended whisky, spiced rum, a sorghum single malt and gin, told through slow, rich scroll animation.',
    tags: ['Brand', 'Drinks', 'Scroll animation'],
    video: clip('john-cash'),
    liveUrl: 'https://john-cash-site.vercel.app',
    placeholder: false,
  },
  {
    name: 'Hooks by Tarie',
    summary:
      'A one-page site for a handmade crochet business in Harare and Chinhoyi: scrunchies, hats, cardigans and made-to-measure dresses, with orders going straight to WhatsApp.',
    tags: ['Small business', 'Fashion', 'One page'],
    video: clip('hooks-by-tarie'),
    liveUrl: 'https://hooksbytarie.pages.dev',
    placeholder: false,
  },
  {
    name: 'Oasis Family Ministries',
    summary:
      'A church website for a ministry in Zimbabwe: plan a visit, read the daily verse, request prayer, watch messages and see what’s coming up.',
    tags: ['Church', 'Community', 'Events'],
    video: clip('oasis'),
    liveUrl: 'https://oasis-family-ministries.vercel.app',
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
];
