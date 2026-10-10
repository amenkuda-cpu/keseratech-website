import { COMPANY, type DivisionSlug } from './site';

// Division page content beyond the basics in site.ts.

export type DivisionPage = {
  signature: 'services' | 'irrigation' | 'ev' | 'upcycle' | 'assistants' | 'front-desk';
  signatureTitle: string;
  signatureText: string;
  approach: { title: string; text: string }[];
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const partner = (division: string) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(division === 'Sera Home' ? 'Sera Home: build enquiry' : `${division}: partnership enquiry`)}`;

export const DIVISION_PAGES: Record<DivisionSlug, DivisionPage> = {
  'sera-tech': {
    signature: 'services',
    signatureTitle: 'What Sera Tech builds',
    signatureText: 'Three disciplines, one team. Sera Tech builds for clients with the same engineering it uses for Kesera’s own platforms.',
    approach: [
      { title: 'Scope', text: 'A short call to understand the business, the users and what success looks like. You get a written scope and price.' },
      { title: 'Design', text: 'Structure, screens and content designed around your customers, reviewed with you before code.' },
      { title: 'Build and test', text: 'Built in stages you can see, tested on real devices and real data.' },
      { title: 'Launch and support', text: 'Deployed, handed over and supported, with the support agreed before the project starts.' },
    ],
    primary: { label: 'Start a project', href: '/start' },
    secondary: { label: 'See pricing', href: '/pricing' },
  },
  agrisera: {
    signature: 'irrigation',
    signatureTitle: 'Smart irrigation',
    signatureText: 'Water delivered where and when crops need it. Sensors measure the soil, a controller decides, valves deliver, and every litre is recorded.',
    approach: [
      { title: 'Sense', text: 'Soil-moisture and weather sensors report conditions zone by zone.' },
      { title: 'Decide', text: 'The controller waters the zones that need it, based on the crop, not the clock.' },
      { title: 'Deliver', text: 'Valves and pumps open for exactly as long as needed, and the farmer can always take over.' },
      { title: 'Record', text: 'Every cycle and every litre is logged, so water use can be measured and improved.' },
    ],
    primary: { label: 'Partner with AgriSera', href: partner('AgriSera') },
    secondary: { label: 'Smart Irrigation project', href: '/projects/smart-irrigation' },
  },
  'sera-energy': {
    signature: 'ev',
    signatureTitle: 'Smart EV charging',
    signatureText: 'Connected charging sites that report their status live, share limited power intelligently and draw on solar and storage when the grid can’t keep up.',
    approach: [
      { title: 'Find', text: 'Drivers see which chargers are free before they set off.' },
      { title: 'Charge', text: 'Start, follow and pay for a charge from a phone.' },
      { title: 'Balance', text: 'Power is shared across bays by what the site can supply, from grid, solar or storage.' },
      { title: 'Monitor', text: 'Every site is watched remotely, so faults are found before drivers find them.' },
    ],
    primary: { label: 'Partner with Sera Energy', href: partner('Sera Energy') },
    secondary: { label: 'Smart EV Charging project', href: '/projects/smart-ev-charging' },
  },
  'sera-home': {
    signature: 'upcycle',
    signatureTitle: 'How waste becomes a home',
    signatureText: 'Every Sera Home build starts with something that was going to be thrown away. Choose a material to see how it moves from discarded, through transformation, to a finished space or product.',
    approach: [
      { title: 'Recover', text: 'Containers, drums, tyres, bottles, timber and scrap, collected locally before they become waste.' },
      { title: 'Clean and assess', text: 'Every piece is cleaned, checked for soundness and kept only if it is safe to reuse.' },
      { title: 'Transform', text: 'Cut, welded, insulated, sanded and sealed into something new.' },
      { title: 'Fit out and finish', text: 'Power, water, solar, smart controls and finishes, so it works as well as it looks.' },
    ],
    primary: { label: 'Enquire about a build', href: partner('Sera Home') },
    secondary: { label: 'See real examples', href: '/sera-home#examples' },
  },
  'sera-assistants': {
    signature: 'assistants',
    signatureTitle: 'Assistants that act',
    signatureText: 'An assistant is only useful if it can do something. Ours are connected to your stock, calendar, CRM and messaging, and hand over to people when they should.',
    approach: [
      { title: 'Learn the business', text: 'Products, prices, policies and tone, from your own material.' },
      { title: 'Connect', text: 'WhatsApp, your website, email and the systems behind them.' },
      { title: 'Guard', text: 'Clear limits on what it can do, and a hand-over to a person whenever it should.' },
      { title: 'Improve', text: 'Conversations reviewed and the assistant tuned on what customers really ask.' },
    ],
    primary: { label: 'Build an assistant', href: '/start?service=automation&type=assistant' },
  },
  'sera-front-desk': {
    signature: 'front-desk',
    signatureTitle: 'Every call answered',
    signatureText: 'Sera Front Desk picks up every call, day or night, and handles the routine ones completely: bookings, changes, cancellations and messages.',
    approach: [
      { title: 'Your voice', text: 'Greeting, services, hours and policies set up for your business.' },
      { title: 'Your calendar', text: 'Connected to the booking system you already use.' },
      { title: 'Your rules', text: 'What it may book, when to transfer and who to alert.' },
      { title: 'Your records', text: 'Every call logged with a summary you can search.' },
    ],
    primary: { label: 'Build your digital front desk', href: '/start?service=automation&type=receptionist' },
  },
};
