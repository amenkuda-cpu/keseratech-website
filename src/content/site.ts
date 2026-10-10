// Fixed site content: divisions, contact details, navigation.
// Editable content (prices, projects, enquiries) lives in the database; see src/lib/db.

export const COMPANY = {
  short: 'Kesera',
  legal: 'Kesera Technologies Holdings Private Limited',
  website: 'keseratech.com',
  email: 'info@keseratech.com',
  phone: '+263 785 582 197',
  phoneHref: 'tel:+263785582197',
  whatsappHref: 'https://wa.me/263785582197',
  country: 'Zimbabwe',
} as const;

/** Public names of Kesera ventures. Change here if a product is renamed. */
export const VENTURE_NAMES = {
  delivery: 'BikerDash',
} as const;

export const STATUSES = ['CONCEPT', 'RESEARCH', 'PROTOTYPE', 'IN_DEVELOPMENT', 'PILOT', 'COMING_SOON', 'ACTIVE'] as const;
export type ProjectStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  CONCEPT: 'Concept',
  RESEARCH: 'Research',
  PROTOTYPE: 'Prototype',
  IN_DEVELOPMENT: 'In development',
  PILOT: 'Pilot',
  COMING_SOON: 'Coming soon',
  ACTIVE: 'Active',
};

export const DIVISION_SLUGS = ['sera-tech', 'agrisera', 'sera-energy', 'sera-home', 'sera-assistants', 'sera-front-desk'] as const;
export type DivisionSlug = (typeof DIVISION_SLUGS)[number];

export type Division = {
  slug: DivisionSlug;
  name: string;
  /** CSS colour (token var) used for the division's dot, hairlines and schematic highlights. */
  accent: string;
  discipline: string;
  short: string;
  headline: string;
  intro: string;
  focus: string[];
};

export const DIVISIONS: Division[] = [
  {
    slug: 'sera-tech',
    name: 'Sera Tech',
    accent: 'var(--color-tech)',
    discipline: 'Software',
    short: 'Websites, apps and custom software: the commercial technology studio of Kesera.',
    headline: 'Software built around how you work.',
    intro:
      'Sera Tech designs and builds websites, mobile apps, web applications and business systems. It is also where Kesera builds its own platforms, starting with BikerDash.',
    focus: ['Website development', 'Mobile apps', 'Web applications', 'Custom software', 'Business systems', 'Automation', 'APIs and integrations', 'Databases', 'Digital platforms'],
  },
  {
    slug: 'agrisera',
    name: 'AgriSera',
    accent: 'var(--color-agri)',
    discipline: 'Agriculture',
    short: 'Agricultural engineering: smart irrigation, sensing and automation for farms.',
    headline: 'Engineering the future of agriculture.',
    intro:
      'AgriSera applies sensors, data and automation to farming problems, starting with water. Its first project is smart irrigation that delivers water where and when crops need it.',
    focus: ['Smart irrigation', 'Water-saving technology', 'Agricultural automation', 'Crop monitoring', 'Agricultural robotics', 'Crop disease detection'],
  },
  {
    slug: 'sera-energy',
    name: 'Sera Energy',
    accent: 'var(--color-energy)',
    discipline: 'Energy & mobility',
    short: 'Energy technology and the charging infrastructure electric mobility needs.',
    headline: 'Powering what moves next.',
    intro:
      'Sera Energy is working toward smart EV charging infrastructure for Zimbabwe: connected chargers, energy management and the software that ties them together.',
    focus: ['EV charging infrastructure', 'Smart EV charging', 'Energy management', 'Connected charging', 'Future mobility'],
  },
  {
    slug: 'sera-home',
    name: 'Sera Home',
    accent: 'var(--color-home)',
    discipline: 'Sustainable building',
    short: 'Sustainable homes, spaces and furniture made from recycled, reused and upcycled materials.',
    headline: 'From discarded to lived in.',
    intro:
      'Sera Home builds sustainable homes through recycling, reuse and upcycling. Shipping containers become homes, gyms and offices; empty oil drums become chairs, tables and handwashing stations; discarded and locally available materials become buildings, furniture and facilities that are practical, attractive and responsible.',
    focus: [
      'Shipping-container homes',
      'Container gyms, offices and shops',
      'Oil-drum chairs and tables',
      'Chair-and-table sets',
      'Handwashing stations',
      'Recycled-material construction',
      'Upcycled furniture and products',
      'Smart home systems',
    ],
  },
  {
    slug: 'sera-assistants',
    name: 'Sera Assistants',
    accent: 'var(--color-assist)',
    discipline: 'Artificial intelligence',
    short: 'AI assistants that answer, act and hand over to people when it matters.',
    headline: 'Intelligence that works.',
    intro:
      'Sera Assistants builds AI assistants and automated workflows for businesses: answering customers, qualifying enquiries and taking routine work off people’s desks.',
    focus: ['AI assistants', 'Business automation', 'Intelligent workflows', 'AI customer interaction', 'Multilingual assistants'],
  },
  {
    slug: 'sera-front-desk',
    name: 'Sera Front Desk',
    accent: 'var(--color-desk)',
    discipline: 'AI reception',
    short: 'An AI receptionist that answers calls, books appointments and updates your systems.',
    headline: 'Your business. Always answered.',
    intro:
      'Sera Front Desk answers the phone for your business: it understands what callers need, books, reschedules or cancels appointments, captures their details and logs every conversation.',
    focus: ['Answering calls', 'Booking appointments', 'Rescheduling', 'Cancelling appointments', 'Capturing customer information', 'Updating business systems'],
  },
];

export const divisionBySlug = (slug: string) => DIVISIONS.find((d) => d.slug === slug);

export const NAV = [
  { href: '/#divisions', label: 'Divisions' },
  { href: '/projects', label: 'Projects' },
  { href: '/sera-tech', label: 'Sera Tech' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
] as const;

export const SERVICES = [
  {
    id: 'website',
    index: '01',
    name: 'Website development',
    cta: 'Build a website',
    summary: 'Professional digital experiences for businesses and organisations.',
    examples: ['Business websites', 'Corporate websites', 'Landing pages', 'E-commerce', 'Booking websites', 'Custom websites'],
  },
  {
    id: 'app',
    index: '02',
    name: 'App development',
    cta: 'Build an app',
    summary: 'Mobile applications for businesses, platforms and services.',
    examples: ['Delivery apps', 'Marketplace apps', 'Booking apps', 'Customer apps', 'Business apps', 'Service platforms'],
  },
  {
    id: 'software',
    index: '03',
    name: 'Software development',
    cta: 'Build software',
    summary: 'Custom technology built around the way a business actually operates.',
    examples: ['Management systems', 'Dashboards', 'CRM systems', 'Inventory systems', 'HR systems', 'Booking systems', 'Business automation', 'Custom platforms'],
  },
] as const;

export const PIPELINE = [
  { id: 'idea', label: 'Idea', note: 'A real problem worth solving.' },
  { id: 'research', label: 'Research', note: 'Users, constraints, what exists.' },
  { id: 'design', label: 'Design', note: 'Systems, interfaces, hardware.' },
  { id: 'prototype', label: 'Prototype', note: 'The smallest thing that proves it.' },
  { id: 'build', label: 'Build', note: 'Production engineering.' },
  { id: 'test', label: 'Test', note: 'In the field, with real people.' },
  { id: 'deploy', label: 'Deploy', note: 'Live, supported, measured.' },
  { id: 'scale', label: 'Scale', note: 'More places, more people.' },
] as const;
export type PipelineStage = (typeof PIPELINE)[number]['id'];

/** The pipeline stage a project status corresponds to. */
export const STATUS_STAGE: Record<ProjectStatus, PipelineStage> = {
  CONCEPT: 'idea',
  RESEARCH: 'research',
  PROTOTYPE: 'prototype',
  IN_DEVELOPMENT: 'build',
  PILOT: 'test',
  COMING_SOON: 'deploy',
  ACTIVE: 'deploy',
};
