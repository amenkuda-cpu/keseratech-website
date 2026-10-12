import type { Project } from '@/lib/db';
import { VENTURE_NAMES } from './site';

// First-run content for the projects CMS. After the database exists, edit projects in /admin.
// Copy rule: describe what is being built and tested, never claim launches, users or results.

export const SEED_PROJECTS: Project[] = [
  {
    slug: 'pocketjobs',
    name: 'PocketJobs',
    kind: 'venture',
    division: 'sera-tech',
    status: 'LIVE',
    tagline: 'Hire trusted local help, right from your pocket',
    headline: 'Trusted hands.\nRight in your pocket.',
    summary:
      'PocketJobs connects people across Zimbabwe with verified local service providers: cleaners, plumbers, electricians, movers, tutors and more. Post a job in a minute, get offers from verified pros nearby, chat without giving out your number, track your provider on the way, and pay in cash when the job is done. Free on iPhone and Android.',
    capabilities: [
      'Post a job free in about a minute',
      'Offers from verified, reviewed providers nearby',
      'Chat and share photos without sharing your number',
      'Track your provider on the way to the job',
      'Pay the provider in cash on completion, no platform fee on the job',
      'Instant alerts for new jobs and offers',
      'Nine categories, from home repairs to tutoring and events',
    ],
    sections: [
      {
        title: 'The problem',
        text: 'Finding a reliable plumber, cleaner or electrician usually means asking around and hoping. Skilled people who do good work struggle to be found beyond their own neighbourhood.',
      },
      {
        title: 'What we built',
        text: 'A marketplace app for both sides. People who need something done post a job and choose from offers by verified providers nearby; providers get alerts for work around them, make offers and build a reputation through reviews. Chat, photos and live tracking happen inside the app, and payment is cash on completion.',
      },
      {
        title: 'Where it is now',
        text: 'PocketJobs is finished and live: download it free on the App Store and Google Play, or visit pocketjobs.co.',
      },
    ],
    visual: 'marketplace',
    links: {
      website: 'https://pocketjobs.co',
      appStore: 'https://apps.apple.com/us/app/pocketjobs-co/id6791999235',
      googlePlay: 'https://play.google.com/store/apps/details?id=co.pocketjobs.app',
    },
    client: null,
    featured: true,
    published: true,
    sort: 0,
  },
  {
    slug: 'bikerdash',
    name: VENTURE_NAMES.delivery,
    kind: 'venture',
    division: 'sera-tech',
    status: 'IN_DEVELOPMENT',
    tagline: 'Delivery + parcels + errands',
    headline: 'Deliveries.\nParcels.\nErrands.\nOne platform.',
    summary:
      `${VENTURE_NAMES.delivery} is a delivery platform being developed by Sera Tech for Zimbabwe: food and groceries from local shops, parcels sent across town, and everyday errands, all carried by motorbike riders. More than food delivery: your everyday delivery and errands platform.`,
    capabilities: [
      'Food and grocery ordering from local shops',
      'Send a parcel: riders offer a fee, you choose',
      'Live rider tracking with arrival times',
      'EcoCash, OneMoney, InnBucks, cards or cash',
      'Rider app with earnings and navigation',
      'Shop portal for orders and menus',
      'Errands (planned)',
    ],
    sections: [
      {
        title: 'The problem',
        text: 'Getting something across town (a meal, a document, a forgotten charger) usually means a phone call, a negotiation and a guess about when it will arrive. Shops lose sales they could make with reliable delivery, and riders lose time looking for work.',
      },
      {
        title: 'What we are building',
        text: 'One app for customers and riders, a portal for shops and an operations dashboard. Customers order from shops or post a parcel; nearby riders offer a price and the customer picks one, or the platform dispatches the nearest rider automatically. Every step is tracked live, and payment works the way Zimbabwe pays: mobile money, cards or cash.',
      },
      {
        title: 'Where it is now',
        text: 'The platform is in active development and testing. Errands are planned after deliveries and parcels. We will publish real screenshots and pilot details when the product is ready to show.',
      },
    ],
    visual: 'delivery',
    client: null,
    featured: true,
    published: true,
    sort: 2,
  },
  {
    slug: 'smart-irrigation',
    name: 'Smart Irrigation',
    kind: 'venture',
    division: 'agrisera',
    status: 'IN_DEVELOPMENT',
    tagline: 'Smart water-saving agriculture',
    headline: 'Smarter water.\nBetter farming.',
    summary:
      'AgriSera is developing smart irrigation that measures what the soil and crop need and delivers water where and when it is needed: less waste, steadier yields and a clear record of every litre.',
    capabilities: [
      'Soil-moisture and weather sensing',
      'Automatic valve and pump control by zone',
      'Watering schedules from crop needs, not the clock',
      'Water-use records for every zone',
      'Alerts for leaks, dry zones and pump faults',
    ],
    sections: [
      {
        title: 'The problem',
        text: 'Water is the limiting input on many farms. Fixed schedules over-water some zones and under-water others, pumping costs energy, and nobody can say exactly how much water each crop used.',
      },
      {
        title: 'What we are building',
        text: 'Sensors in the field report moisture and conditions. A controller decides which zones need water and opens the right valves for the right time. The farmer sees every zone, every cycle and every litre, and can always take over manually.',
      },
      {
        title: 'Where it is now',
        text: 'Smart irrigation is in development. Field results will be published from pilots, not before.',
      },
    ],
    visual: 'irrigation',
    client: null,
    featured: true,
    published: true,
    sort: 1,
  },
  {
    slug: 'smart-ev-charging',
    name: 'Smart EV Charging',
    kind: 'venture',
    division: 'sera-energy',
    status: 'IN_DEVELOPMENT',
    tagline: 'EV charging infrastructure for Zimbabwe',
    headline: 'Powering\nZimbabwe’s next move.',
    summary:
      'Sera Energy is working toward smart EV charging infrastructure for Zimbabwe: connected chargers in the places people already stop, managed by software that balances demand, power availability and price.',
    capabilities: [
      'Connected charging points',
      'Find a charger, check it is free, pay',
      'Load management for limited grid capacity',
      'Solar and storage integration',
      'Remote monitoring and fault alerts',
    ],
    sections: [
      {
        title: 'The problem',
        text: 'Electric vehicles only make sense where you can charge them reliably. In Zimbabwe that means designing for real conditions: limited grid capacity, load-shedding and drivers who need to know a charger works before they set off.',
      },
      {
        title: 'What we are building',
        text: 'Charging sites that report their status in real time, software that schedules charging around available power (including solar and storage), and a simple way for drivers to find, start and pay for a charge.',
      },
      {
        title: 'Where it is now',
        text: 'Smart EV charging is in development. Sites, partners and dates will be announced when they are confirmed.',
      },
    ],
    visual: 'ev',
    client: null,
    featured: true,
    published: true,
    sort: 3,
  },
  {
    slug: 'sustainable-homes',
    name: 'Sustainable Homes',
    kind: 'venture',
    division: 'sera-home',
    status: 'ACTIVE',
    tagline: 'Homes, spaces and furniture from reclaimed materials',
    headline: 'Discarded.\nTransformed.\nLived in.',
    summary:
      'Sera Home builds sustainable homes through recycling, reuse and upcycling. Shipping containers become homes, gyms and offices; empty oil drums become chairs, tables and handwashing stations; discarded and locally available materials become practical, attractive buildings, furniture and facilities.',
    capabilities: [
      'Shipping-container homes, gyms and offices',
      'Oil-drum chairs, tables and chair-and-table sets',
      'Handwashing stations from reclaimed drums',
      'Buildings and furniture from recycled materials',
      'Solar power and smart controls built in',
    ],
    sections: [
      {
        title: 'The problem',
        text: 'Shipping containers, oil drums, tyres, bottles and timber are thrown away every day, while homes, workspaces, furniture and clean handwashing facilities are expensive to build from new.',
      },
      {
        title: 'What we build',
        text: 'Sera Home recovers those materials, cleans and checks them, and transforms them: containers are cut, framed, insulated and fitted out as homes, gyms and offices; drums are cut, welded and sealed into chairs, tables and handwashing stations; other reclaimed materials become walls, furniture and facilities.',
      },
      {
        title: 'Why it matters',
        text: 'Every build keeps material out of the waste stream and uses less new steel, cement and timber, while giving people spaces and products that work and look good.',
      },
    ],
    visual: 'upcycle',
    client: null,
    featured: true,
    published: true,
    sort: 4,
  },
];
