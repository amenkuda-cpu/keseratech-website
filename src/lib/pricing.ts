// Pricing model shared by the pricing page, the project builder and the admin.
// Money is integer US cents everywhere; format only for display with formatUsd().

import { z } from 'zod';

export const PLAN_GROUPS = ['website', 'app', 'chatbot', 'automation', 'crm'] as const;
export type PlanGroup = (typeof PLAN_GROUPS)[number];

export const SERVICE_IDS = ['website', 'app', 'software', 'webapp', 'automation', 'unsure'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

/** How each package group is named on the site, and which project-builder service it starts. */
export const PLAN_GROUP_INFO: Record<PlanGroup, { label: string; tab: string; service: ServiceId }> = {
  website: { label: 'Website', tab: 'Websites', service: 'website' },
  app: { label: 'Mobile App', tab: 'Mobile apps', service: 'app' },
  chatbot: { label: 'AI Chatbot', tab: 'AI chatbots', service: 'automation' },
  automation: { label: 'AI Automation', tab: 'AI automation', service: 'automation' },
  crm: { label: 'CRM & Dashboards', tab: 'CRM & dashboards', service: 'software' },
};

/** "Pro Mobile App" -> "Pro": the tier, with the group's own name taken off. */
export const planTier = (p: Pick<Plan, 'name' | 'group'>) => {
  const label = PLAN_GROUP_INFO[p.group].label;
  return p.name.toLowerCase().endsWith(label.toLowerCase()) ? p.name.slice(0, -label.length).trim() || p.name : p.name;
};

export const planSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  group: z.enum(PLAN_GROUPS),
  name: z.string().min(1).max(60),
  priceCents: z.number().int().min(0),
  /** Shown as "$250+" */
  plus: z.boolean(),
  /** Shown as "From $600" */
  from: z.boolean(),
  blurb: z.string().max(200),
  features: z.array(z.string().min(1).max(120)).max(14),
  highlight: z.string().max(30).nullable(),
  sort: z.number().int(),
  /** A proposed price the owner hasn't confirmed yet. Shown publicly as normal, flagged in the admin. */
  proposal: z.boolean(),
  /** A monthly fee on top of the one-off price: shown as "+ $20 / month". */
  monthlyCents: z.number().int().min(0).nullable().default(null),
  /** A short line under the price, e.g. "Monthly plan quoted". */
  note: z.string().max(60).nullable().default(null),
});
export type Plan = z.infer<typeof planSchema>;

/** Bump when DEFAULT_PLANS must replace the stored plans once (db.ts applies it on start-up). */
export const PLANS_VERSION = 2;

const optionSchema = z.object({ id: z.string(), label: z.string(), cents: z.number().int().min(0) });
const multiplierSchema = z.object({ id: z.string(), label: z.string(), multiplier: z.number().min(0.5).max(3) });

export const serviceConfigSchema = z.object({
  label: z.string(),
  types: z.array(optionSchema),
  features: z.array(optionSchema),
  /** high estimate = low × spread */
  spread: z.number().min(1).max(3),
  /** Whether the number-of-users question applies. */
  usesUserTiers: z.boolean(),
});
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;

export const estimatorSchema = z.object({
  services: z.object({
    website: serviceConfigSchema,
    app: serviceConfigSchema,
    software: serviceConfigSchema,
    webapp: serviceConfigSchema,
    automation: serviceConfigSchema,
  }),
  userTiers: z.array(multiplierSchema),
  timelines: z.array(multiplierSchema),
});
export type EstimatorConfig = z.infer<typeof estimatorSchema>;
export type EstimableService = keyof EstimatorConfig['services'];

export const isEstimable = (s: ServiceId): s is EstimableService => s !== 'unsure';

export type EstimateInput = {
  service: ServiceId;
  type?: string | null;
  features?: string[];
  timeline?: string | null;
  users?: string | null;
  /** A chosen package (website/app plan) replaces the project type's base price. */
  packageCents?: number | null;
};

export type Estimate = { lowCents: number; highCents: number };

export function estimateBreakdown(config: EstimatorConfig, input: EstimateInput) {
  if (!isEstimable(input.service)) return null;
  const svc = config.services[input.service];
  const type = svc.types.find((t) => t.id === input.type);
  const chosen = new Set(input.features ?? []);
  return {
    base: input.packageCents ?? type?.cents ?? null,
    features: svc.features.filter((f) => chosen.has(f.id)),
    users: svc.usesUserTiers ? config.userTiers.find((u) => u.id === input.users) ?? null : null,
    timeline: config.timelines.find((t) => t.id === input.timeline) ?? null,
  };
}

const roundTo = (cents: number, stepCents: number) => Math.round(cents / stepCents) * stepCents;

/**
 * Estimated price range for a project. Returns null when there's nothing to estimate yet
 * ("Not sure", or no project type chosen).
 */
export function estimate(config: EstimatorConfig, input: EstimateInput): Estimate | null {
  if (!isEstimable(input.service)) return null;
  const svc = config.services[input.service];
  const type = svc.types.find((t) => t.id === input.type);
  const baseCents = input.packageCents ?? type?.cents;
  if (baseCents === undefined) return null;

  const chosen = new Set(input.features ?? []);
  const featureCents = svc.features.filter((f) => chosen.has(f.id)).reduce((sum, f) => sum + f.cents, 0);
  const users = svc.usesUserTiers ? config.userTiers.find((u) => u.id === input.users)?.multiplier ?? 1 : 1;
  const timeline = config.timelines.find((t) => t.id === input.timeline)?.multiplier ?? 1;

  const base = (baseCents + featureCents) * users * timeline;
  const lowCents = Math.max(roundTo(base, 1000), 1000);
  const highCents = Math.max(roundTo(base * svc.spread, 5000), lowCents);
  return { lowCents, highCents };
}

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function planPriceLabel(p: Pick<Plan, 'priceCents' | 'plus' | 'from'>): { prefix: string; amount: string; suffix: string } {
  return { prefix: p.from ? 'From' : '', amount: formatUsd(p.priceCents), suffix: p.plus ? '+' : '' };
}

/** "+ $20 / month", or the plan's note ("Monthly plan quoted"), or null. */
export function planSubline(p: Pick<Plan, 'monthlyCents' | 'note'>): string | null {
  if (p.monthlyCents) return `+ ${formatUsd(p.monthlyCents)} / month`;
  return p.note || null;
}

// ---------------------------------------------------------------------------
// Defaults: the Sera Tech price cards (November 2026). The Basic and Corporate website
// plans predate those cards and are unchanged. Edit live prices in /admin.

type PlanSeed = Omit<Plan, 'blurb' | 'plus' | 'from' | 'highlight' | 'proposal' | 'monthlyCents' | 'note'> & Partial<Plan>;
const plan = (p: PlanSeed): Plan => ({ blurb: '', plus: false, from: false, highlight: null, proposal: false, monthlyCents: null, note: null, ...p });
const POPULAR = 'Most popular';

export const DEFAULT_PLANS: Plan[] = [
  plan({
    id: 'basic-website', group: 'website', name: 'Basic Website', priceCents: 10000, sort: 1,
    blurb: 'A clear, professional presence for a new or small business.',
    features: ['Custom 3-page website', 'Responsive design', 'Basic SEO setup', 'Logo integration', 'Contact form'],
  }),
  plan({
    id: 'pro-website', group: 'website', name: 'Pro Website', priceCents: 18000, sort: 2, highlight: POPULAR,
    blurb: 'A fuller site that brings in and measures enquiries.',
    features: ['Custom 6-page website', 'Responsive design', 'Contact form', 'Social media integration', 'Google Analytics + Maps', '6 months hosting support'],
  }),
  plan({
    id: 'corporate-website', group: 'website', name: 'Corporate Website', priceCents: 25000, plus: true, sort: 3,
    blurb: 'For organisations that sell, manage users or run operations online.',
    features: ['Custom website design', 'E-commerce ready', 'Admin panel', 'User accounts / dashboards', 'Ongoing support quoted separately'],
  }),

  plan({
    id: 'basic-app', group: 'app', name: 'Basic Mobile App', priceCents: 20000, sort: 1,
    features: ['Android app (up to 5 screens)', 'Modern, clean design', 'User login & accounts', 'Push notifications', 'Play Store publishing'],
  }),
  plan({
    id: 'pro-app', group: 'app', name: 'Pro Mobile App', priceCents: 35000, sort: 2, highlight: POPULAR,
    features: ['Android + iOS app', 'Up to 10 screens', 'Admin dashboard', 'Payment integration', 'Push notifications', '3 months support'],
  }),
  plan({
    id: 'corporate-app', group: 'app', name: 'Corporate Mobile App', priceCents: 60000, plus: true, sort: 3,
    features: ['Fully custom app', 'Android, iOS + web', 'Backend & database', 'API integrations', 'Ongoing support (quoted)'],
  }),

  plan({
    id: 'basic-chatbot', group: 'chatbot', name: 'Basic AI Chatbot', priceCents: 4000, monthlyCents: 1000, sort: 1,
    features: ['WhatsApp or website bot', 'Answers FAQs 24/7', 'Captures leads', 'Business hours replies', 'Setup & training'],
  }),
  plan({
    id: 'pro-chatbot', group: 'chatbot', name: 'Pro AI Chatbot', priceCents: 8000, monthlyCents: 2000, sort: 2, highlight: POPULAR,
    features: ['WhatsApp + website bot', 'AI trained on your business', 'Orders & bookings', 'Human handover', 'Monthly chat reports', 'Priority support'],
  }),
  plan({
    id: 'corporate-chatbot', group: 'chatbot', name: 'Corporate AI Chatbot', priceCents: 15000, plus: true, note: 'Monthly plan quoted', sort: 3,
    features: ['WhatsApp, web + social media', 'Payment integration', 'CRM integration', 'Custom workflows', 'Ongoing support (quoted)'],
  }),

  plan({
    id: 'basic-automation', group: 'automation', name: 'Basic AI Automation', priceCents: 8000, monthlyCents: 2500, sort: 1,
    features: ['AI call answering 24/7', 'Answers customer FAQs', 'Call summaries to WhatsApp', '1 business line', 'Setup & training'],
  }),
  plan({
    id: 'pro-automation', group: 'automation', name: 'Pro AI Automation', priceCents: 15000, monthlyCents: 4500, sort: 2, highlight: POPULAR,
    features: ['AI receptionist 24/7', 'Appointment booking', 'Calendar integration', 'WhatsApp & SMS follow-ups', 'Call recordings + summaries', 'Priority support'],
  }),
  plan({
    id: 'corporate-automation', group: 'automation', name: 'Corporate AI Automation', priceCents: 25000, plus: true, note: 'Monthly plan quoted', sort: 3,
    features: ['Multi-line AI call centre', 'Custom workflow automation', 'CRM integration', 'Multi-language support', 'Dedicated support (quoted)'],
  }),

  plan({
    id: 'basic-crm', group: 'crm', name: 'Basic CRM & Dashboards', priceCents: 10000, sort: 1,
    features: ['Sales & customer dashboard', 'Live charts & reports', 'Excel / Sheets integration', 'Mobile friendly', '1 month support'],
  }),
  plan({
    id: 'pro-crm', group: 'crm', name: 'Pro CRM & Dashboards', priceCents: 18000, sort: 2, highlight: POPULAR,
    features: ['Custom CRM system', 'Customer & lead tracking', 'Staff accounts & roles', 'Live reports & charts', 'Data export', '3 months support'],
  }),
  plan({
    id: 'corporate-crm', group: 'crm', name: 'Corporate CRM & Dashboards', priceCents: 30000, plus: true, sort: 3,
    features: ['Full business system', 'Inventory, finance + HR', 'Connects to your tools', 'Advanced analytics', 'Ongoing support (quoted)'],
  }),
];

const t = (id: string, label: string, dollars: number) => ({ id, label, cents: dollars * 100 });

export const DEFAULT_ESTIMATOR: EstimatorConfig = {
  services: {
    website: {
      label: 'Website',
      spread: 1.4,
      usesUserTiers: false,
      types: [
        t('landing', 'Landing page', 100), t('business', 'Business website', 180), t('corporate', 'Corporate website', 250),
        t('booking', 'Booking website', 300), t('ecommerce', 'E-commerce store', 350), t('custom', 'Custom website', 250),
      ],
      features: [
        t('pages', 'Up to 5 extra pages', 40), t('blog', 'News or blog you can edit', 40), t('payments', 'Online payments (EcoCash, cards)', 80),
        t('booking', 'Online booking', 60), t('accounts', 'User accounts', 100), t('admin', 'Admin panel', 80),
        t('multilingual', 'More than one language', 50), t('seo', 'Advanced SEO', 30), t('copy', 'Copywriting', 40), t('whatsapp', 'WhatsApp chat button', 10),
      ],
    },
    app: {
      label: 'Mobile app',
      spread: 1.5,
      usesUserTiers: false,
      types: [
        t('simple', 'Simple information app', 600), t('customer', 'Customer app', 1200), t('business', 'Business app', 1200),
        t('booking', 'Booking app', 1500), t('marketplace', 'Marketplace app', 3000), t('delivery', 'Delivery app', 3500),
      ],
      features: [
        t('accounts', 'User accounts', 150), t('payments', 'Payments (EcoCash, OneMoney, cards)', 250), t('maps', 'Maps and live tracking', 300),
        t('push', 'Push notifications', 80), t('chat', 'In-app chat', 200), t('admin', 'Admin dashboard', 250),
        t('roles', 'Separate apps for customers and providers', 400), t('offline', 'Works offline', 150),
      ],
    },
    software: {
      label: 'Software',
      spread: 1.6,
      usesUserTiers: true,
      types: [
        t('management', 'Management system', 800), t('dashboard', 'Dashboards and reporting', 600), t('crm', 'CRM system', 900),
        t('inventory', 'Inventory system', 900), t('hr', 'HR system', 1000), t('booking', 'Booking system', 700), t('platform', 'Custom platform', 1200),
      ],
      features: [
        t('admin', 'Admin dashboard', 200), t('accounts', 'User accounts and roles', 150), t('database', 'Database and data migration', 150),
        t('payments', 'Payments', 250), t('apis', 'APIs', 200), t('automation', 'Automation', 250),
        t('notifications', 'Notifications (email, SMS, WhatsApp)', 120), t('integrations', 'Integrations (accounting, ERP…)', 200),
      ],
    },
    webapp: {
      label: 'Web app',
      spread: 1.6,
      usesUserTiers: true,
      types: [
        t('internal', 'Internal tool', 500), t('portal', 'Customer portal', 600), t('saas', 'Subscription product (SaaS)', 1500), t('marketplace', 'Marketplace', 2000),
      ],
      features: [
        t('admin', 'Admin dashboard', 200), t('accounts', 'User accounts and roles', 150), t('payments', 'Payments and subscriptions', 300),
        t('apis', 'APIs', 200), t('automation', 'Automation', 250), t('notifications', 'Notifications (email, SMS, WhatsApp)', 120),
        t('integrations', 'Integrations', 200), t('reports', 'Reports and exports', 150),
      ],
    },
    automation: {
      label: 'Automation & AI',
      spread: 1.5,
      usesUserTiers: false,
      types: [
        t('assistant', 'AI assistant (Sera Assistants)', 400), t('receptionist', 'AI receptionist (Sera Front Desk)', 600),
        t('workflow', 'Workflow automation', 300), t('documents', 'Document and report automation', 250), t('sync', 'Data sync between systems', 250),
      ],
      features: [
        t('whatsapp', 'WhatsApp channel', 120), t('calendar', 'Calendar and booking integration', 100), t('crm', 'CRM integration', 150),
        t('multilingual', 'Several languages', 120), t('handover', 'Hand over to a person', 80), t('analytics', 'Conversation analytics', 100),
      ],
    },
  },
  userTiers: [
    { id: 'u10', label: '1–10 users', multiplier: 1 },
    { id: 'u50', label: '11–50 users', multiplier: 1.15 },
    { id: 'u250', label: '51–250 users', multiplier: 1.35 },
    { id: 'u250plus', label: '250+ users', multiplier: 1.6 },
  ],
  timelines: [
    { id: 'asap', label: 'ASAP', multiplier: 1.25 },
    { id: '1-2', label: '1–2 months', multiplier: 1.1 },
    { id: '3-6', label: '3–6 months', multiplier: 1 },
    { id: 'flexible', label: 'Flexible', multiplier: 1 },
  ],
};
