// Service landing pages at /services/[slug]. One page per service, each aimed at one search phrase.
// Prices are NOT written here: each page renders the live packages from the pricing database
// (edited in /admin), so these pages always match /pricing.
import type { PlanGroup } from '@/lib/pricing';
import type { Faq, SeoSection } from './types';

export type ServicePage = {
  slug: string;
  /** Service name used in schema.org data and breadcrumbs. */
  name: string;
  /** The search phrase this page is written for. */
  keyword: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  /** Which pricing group to show, and optionally only some packages from it. */
  plans: { group: PlanGroup; ids?: string[] } | null;
  /** Shown above (or instead of) the package cards. */
  priceNote: string;
  sections: SeoSection[];
  faqs: Faq[];
  related: string[];
  /** Pre-filled WhatsApp message. */
  whatsapp: string;
  /** Project form shortcut, e.g. /start?service=website */
  startHref: string;
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'website-design-zimbabwe',
    name: 'Website design and development',
    keyword: 'web design Zimbabwe',
    title: 'Web Design in Zimbabwe from $150 | Kesera Technologies',
    description: 'Professional, fast websites for Zimbabwean businesses, from $150. Designed and built by Kesera Technologies, with clear prices and support after launch.',
    eyebrow: 'Website design · Zimbabwe',
    h1: 'Web design in Zimbabwe that brings you customers.',
    lead:
      'Your website is often the first thing a customer sees before they call you. We design and build fast, good-looking websites for Zimbabwean businesses, with a clear price before we start and real people to talk to after launch.',
    plans: { group: 'website' },
    priceNote: 'Three fixed packages, in US dollars. You know the full price before any work starts.',
    sections: [
      {
        h2: 'Why your business needs a proper website',
        body: [
          'Customers in Zimbabwe search Google before they buy, even when they end up paying in cash or over EcoCash. If they cannot find you, they find the business down the road. A website puts your services, prices, location and contact details in one place that works day and night.',
          'Social media pages help, but you do not own them, and posts disappear in a feed within a day. A website is yours. It ranks on Google, it looks credible when you send a quotation, and it gives every advert and WhatsApp status somewhere to point.',
        ],
      },
      {
        h2: 'What every Kesera website includes',
        body: ['We do not sell templates with your logo dropped in. Every site is designed around your business and what you want visitors to do next.'],
        bullets: [
          'A custom design that matches your brand',
          'A layout that works properly on phones, which is where most Zimbabwean visitors browse',
          'Basic search engine setup so Google can find and understand your pages',
          'A contact form plus one-tap calling and WhatsApp',
          'Fast loading, even on mobile data',
        ],
      },
      {
        h2: 'How we build your website',
        body: ['A website project with us follows four clear steps, and you see progress at each one.'],
        points: [
          { h3: '1. Scope', text: 'We talk through what you sell, who your customers are and what the site must do. You get the price and timeline in writing.' },
          { h3: '2. Design', text: 'We design your pages and share them with you. You comment, we refine, nothing is built until you are happy with the look.' },
          { h3: '3. Build and test', text: 'We build the site, test it on real phones and computers, and set up search basics so it can be found.' },
          { h3: '4. Launch and support', text: 'We put the site live, show you how it works and stay available for changes and questions afterwards.' },
        ],
      },
      {
        h2: 'Built for how Zimbabwe does business',
        body: [
          'We are a Zimbabwean company, so we design for local realities: visitors on mobile data, customers who prefer WhatsApp to email, and payments through EcoCash, cards or cash on delivery. Our work includes company websites, a law firm, a church, online shops and the PocketJobs app, used across the country.',
          'If you need more than a brochure site, we also build online stores, booking systems and business dashboards, so your website can grow with you instead of being rebuilt from scratch.',
        ],
      },
    ],
    faqs: [
      { q: 'How much does a website cost in Zimbabwe?', a: 'Our websites start at $150 for a Basic Website, $180 for the Pro Package with an online shop, and $250 for Full E-commerce with a business dashboard. Bigger custom projects are priced by scope, and you get the full figure in writing before we start.' },
      { q: 'How long does it take to build a website?', a: 'It depends on the number of pages and how quickly content is ready. We agree a timeline with you during scoping, and small business sites are usually the quickest projects we run.' },
      { q: 'Will my website work on phones?', a: 'Yes. Every site we build is designed for phones first, because most visitors in Zimbabwe browse on mobile.' },
      { q: 'Can you help me appear on Google?', a: 'Every package includes basic search engine setup: page titles, descriptions, a sitemap and a fast, mobile-friendly site. We can also set up your Google Business Profile so you show on Maps.' },
      { q: 'Do you work with businesses outside Harare?', a: 'Yes. We are based in Marondera and work with businesses across Zimbabwe and abroad, over WhatsApp, calls and video meetings.' },
    ],
    related: ['ecommerce-website-zimbabwe', 'ai-chatbot-zimbabwe', 'crm-business-dashboards-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like a website for my business.',
    startHref: '/start?service=website',
  },
  {
    slug: 'ecommerce-website-zimbabwe',
    name: 'E-commerce website development',
    keyword: 'e-commerce website Zimbabwe',
    title: 'E-commerce Websites in Zimbabwe from $180 | Kesera',
    description: 'Sell online in Zimbabwe with an online store that takes EcoCash, cards or cash on delivery. E-commerce websites from $180 by Kesera Technologies.',
    eyebrow: 'Online stores · Zimbabwe',
    h1: 'E-commerce websites that sell while you sleep.',
    lead:
      'An online store lets customers browse your products, order and pay without a single phone call. We build e-commerce websites for Zimbabwean businesses that take EcoCash, cards or cash on delivery, and send every order straight to you.',
    plans: { group: 'website', ids: ['ecommerce-website', 'corporate-website'] },
    priceNote: 'Two store packages, in US dollars: a full online shop, or a shop run from its own business dashboard.',
    sections: [
      {
        h2: 'Why sell online in Zimbabwe',
        body: [
          'Many Zimbabwean shops still take orders one WhatsApp message at a time: a customer asks the price, waits for a reply, asks about stock, waits again. Every slow reply is a sale at risk. An online store answers those questions instantly, shows every product with its price, and takes the order while you are busy or asleep.',
          'It also widens your market. A shop in one town can sell to customers in Harare, Bulawayo, Mutare and in the diaspora buying for family at home.',
        ],
      },
      {
        h2: 'Payments that work for your customers',
        body: [
          'A store is only useful if people can pay. We set up checkout around how Zimbabweans actually pay: EcoCash and other mobile money, Visa and Mastercard, or cash on delivery where that suits your business. You choose what to accept.',
          'Every order notifies you by email and WhatsApp, so nothing sits unseen in an inbox.',
        ],
      },
      {
        h2: 'Choose the store that fits your stage',
        body: ['Both packages give you a complete website, not just a shop page.'],
        points: [
          { h3: 'Pro Package', text: 'A six-page website with an online store, your product catalogue, cart and checkout, order notifications, Google Analytics and Maps. Ideal for a growing shop that wants to start selling online properly.' },
          { h3: 'Full E-commerce', text: 'Everything in Pro, plus a dashboard for orders, stock, customers and sales, staff accounts and automated order follow-ups. Built for businesses that run their whole operation through the store.' },
        ],
      },
      {
        h2: 'Proven on real Zimbabwean stores',
        body: [
          'We built the online shop for Naturo Wellness, a Zimbabwean natural drinks brand where customers order and pay online and the owner runs everything from a simple admin. We also built Waterberry Croft, an agricultural store and web app. You can see both on our work page.',
          'After launch we show you how to add products, change prices and manage orders yourself, so you are never waiting on us for everyday changes.',
        ],
      },
    ],
    faqs: [
      { q: 'How much does an online store cost in Zimbabwe?', a: 'Our Pro Package with an online store starts at $180, and Full E-commerce with a business dashboard is $250. You get the full price in writing before we start.' },
      { q: 'Can customers pay with EcoCash?', a: 'Yes. We set up checkout for EcoCash and other mobile money, cards, or cash on delivery, depending on what you want to accept.' },
      { q: 'Can I add and edit products myself?', a: 'Yes. You manage products, prices, stock and orders from an admin area, and we show you how before launch.' },
      { q: 'Will I get notified of new orders?', a: 'Every order sends a notification by email and WhatsApp, so you can respond quickly.' },
      { q: 'Can you deliver orders for me?', a: 'Delivery is run by your business, but the store can show delivery areas, fees and options, and collect the delivery address at checkout.' },
    ],
    related: ['website-design-zimbabwe', 'crm-business-dashboards-zimbabwe', 'ai-chatbot-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like an online store for my business.',
    startHref: '/start?service=website',
  },
  {
    slug: 'app-development-zimbabwe',
    name: 'Mobile app development',
    keyword: 'app developer Zimbabwe',
    title: 'App Developers in Zimbabwe: Android & iOS | Kesera',
    description: 'Android and iOS app development in Zimbabwe, from $250. Kesera built PocketJobs, live on the App Store and Google Play. Clear prices, real support.',
    eyebrow: 'App development · Zimbabwe',
    h1: 'App developers in Zimbabwe who ship real apps.',
    lead:
      'Plenty of people can talk about building an app. We have shipped one: PocketJobs, our marketplace app, is live on the App Store and Google Play and used across Zimbabwe. We bring the same experience to your app, from the first screen to the store listing.',
    plans: { group: 'app' },
    priceNote: 'Three app packages, in US dollars. Larger platforms are priced by scope.',
    sections: [
      {
        h2: 'Apps we build',
        body: ['If your customers need something they can open every day, an app can be the right tool. We build:'],
        bullets: [
          'Booking apps for salons, clinics and service businesses',
          'Delivery and ordering apps',
          'Marketplace apps that connect customers with providers',
          'Customer apps with accounts, loyalty and notifications',
          'Internal business apps for staff, field teams and stock',
        ],
      },
      {
        h2: 'Proof, not promises',
        body: [
          'PocketJobs is our own product. People post a job, get offers from verified local cleaners, plumbers, electricians and tutors, chat, track the provider and pay in cash. Building and running it taught us what Zimbabwean users expect: apps that are light on data, work on mid-range Android phones and keep payment simple.',
          'We are also building BikerDash, a delivery platform, so we understand the logistics side of on-demand apps too.',
        ],
      },
      {
        h2: 'From idea to app store',
        body: ['Every app project runs in clear stages, and you see working screens early instead of waiting months for a reveal.'],
        points: [
          { h3: 'Plan the essentials', text: 'We work out the smallest version of your app that solves the real problem, so you launch sooner and spend less.' },
          { h3: 'Design every screen', text: 'You see and approve the screens before development starts.' },
          { h3: 'Build, test, publish', text: 'We build the app and its admin dashboard, test on real phones and publish it on Google Play and, on the Standard and Premium packages, the App Store.' },
          { h3: 'Support and improve', text: 'Apps need care after launch. Support is included for an agreed period and can continue after that.' },
        ],
      },
      {
        h2: 'Android first, iPhone too',
        body: [
          'Most Zimbabweans use Android, so our Starter App is built for Android and published on Google Play. The Standard App adds iPhone, an admin dashboard, payments and three months of support. The Premium App adds a web version, a full backend and analytics for platforms that need to scale.',
        ],
      },
    ],
    faqs: [
      { q: 'How much does it cost to build an app in Zimbabwe?', a: 'Our app packages start at $250 for a Starter Android app, $350 for Android and iOS with an admin dashboard, and $450 for a fully custom app with a web version. Larger platforms are quoted by scope.' },
      { q: 'Do you build for both Android and iPhone?', a: 'Yes. The Starter App is Android only; the Standard and Premium packages include both Android and iOS.' },
      { q: 'Will you publish my app on the Play Store?', a: 'Yes. We publish your app and set up the store listing with you. Store accounts are registered in your business name so the app belongs to you.' },
      { q: 'Can my app take payments?', a: 'Yes. The Standard and Premium packages include payment integration, and we can connect mobile money and cards depending on your setup.' },
      { q: 'Have you built apps before?', a: 'Yes. Our PocketJobs app is live on the App Store and Google Play, and we are building the BikerDash delivery platform.' },
    ],
    related: ['crm-business-dashboards-zimbabwe', 'website-design-zimbabwe', 'ai-automation-zimbabwe'],
    whatsapp: 'Hi Kesera, I have an idea for an app and would like to discuss it.',
    startHref: '/start?service=app',
  },
  {
    slug: 'ai-chatbot-zimbabwe',
    name: 'AI chatbot development',
    keyword: 'AI chatbot Zimbabwe',
    title: 'AI Chatbots for WhatsApp & Websites in Zimbabwe | Kesera',
    description: 'AI chatbots that answer your customers on WhatsApp and your website 24/7, capture leads and take orders. Built in Zimbabwe, from $40 setup.',
    eyebrow: 'AI chatbots · Zimbabwe',
    h1: 'An AI chatbot that answers customers on WhatsApp, day and night.',
    lead:
      'Your customers message at 10pm, on Sundays and during your busiest hour. An AI chatbot trained on your business answers them instantly, captures their details, takes orders and bookings, and hands over to a person when it matters.',
    plans: { group: 'chatbot' },
    priceNote: 'A once-off setup fee plus a small monthly fee, in US dollars.',
    sections: [
      {
        h2: 'What an AI chatbot does for your business',
        body: [
          'Most enquiries are the same ten questions: prices, opening hours, location, delivery, availability. A chatbot answers them in seconds, every time, in a friendly tone that matches your brand. Your team spends its time on customers who are ready to buy.',
        ],
        bullets: [
          'Answers frequently asked questions 24/7',
          'Captures names, numbers and what each customer wants',
          'Takes orders and bookings (Pro and Corporate)',
          'Hands the chat to a person when a customer needs one',
          'Sends you monthly reports on what customers ask',
        ],
      },
      {
        h2: 'WhatsApp first, because that is where Zimbabwe talks',
        body: [
          'Zimbabwean customers would rather send a WhatsApp message than fill in a form. We build bots for WhatsApp and for your website, and the Corporate plan adds social media channels too. Every bot is set up with your real prices, services and policies, so it gives correct answers instead of vague ones.',
        ],
      },
      {
        h2: 'Trained on your business, not the internet',
        body: [
          'A generic chatbot guesses. Ours learns from your own price list, product details and policies, and we test it with real customer questions before it goes live. If a customer asks something it does not know, it says so and passes the conversation to your team instead of making something up.',
          'You stay in control: you can update answers, review conversations and switch the bot off at any time.',
        ],
      },
      {
        h2: 'Which plan is right for you',
        body: [],
        points: [
          { h3: 'Basic AI Chatbot', text: 'A WhatsApp or website bot that answers FAQs around the clock, captures leads and replies outside business hours.' },
          { h3: 'Pro AI Chatbot', text: 'WhatsApp and website together, trained deeply on your business, with orders, bookings, human handover and monthly reports.' },
          { h3: 'Corporate AI Chatbot', text: 'Multiple channels including social media, payment and CRM integration, and custom workflows for larger teams.' },
        ],
      },
    ],
    faqs: [
      { q: 'How much does an AI chatbot cost in Zimbabwe?', a: 'Our Basic AI Chatbot is $40 to set up and $10 a month. The Pro AI Chatbot is $80 to set up and $20 a month. Corporate bots start at $150 with a monthly plan quoted to your needs.' },
      { q: 'Does the chatbot work on WhatsApp?', a: 'Yes. We build chatbots for WhatsApp, for your website, or both. The Corporate plan adds social media channels.' },
      { q: 'What happens if the bot cannot answer a question?', a: 'It tells the customer honestly and hands the conversation to your team. It does not invent answers.' },
      { q: 'Can the chatbot take orders and bookings?', a: 'Yes, on the Pro and Corporate plans. It collects the details and sends them to you.' },
      { q: 'Do I need technical skills to run it?', a: 'No. We set it up, train it on your business and show you how to update answers and read reports.' },
    ],
    related: ['ai-receptionist-zimbabwe', 'ai-automation-zimbabwe', 'website-design-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like an AI chatbot for my business.',
    startHref: '/start?service=automation',
  },
  {
    slug: 'ai-receptionist-zimbabwe',
    name: 'AI receptionist',
    keyword: 'AI receptionist Zimbabwe',
    title: 'AI Receptionist in Zimbabwe: Never Miss a Call | Kesera',
    description: 'An AI receptionist that answers your business calls 24/7, books appointments and sends call summaries to WhatsApp. From $80 setup, by Kesera Technologies.',
    eyebrow: 'AI receptionist · Zimbabwe',
    h1: 'An AI receptionist so you never miss a call again.',
    lead:
      'Every unanswered call is a customer who might phone your competitor next. Our AI receptionist answers your business line around the clock, understands what callers need, books appointments and sends you a summary of every call on WhatsApp.',
    plans: { group: 'automation' },
    priceNote: 'A once-off setup fee plus a monthly fee, in US dollars.',
    sections: [
      {
        h2: 'Why businesses miss calls, and what it costs',
        body: [
          'A receptionist goes on lunch. A doctor is with a patient. A salon owner has wet hands. The phone rings out and the caller rarely tries twice. For clinics, salons, law firms, schools and service businesses, missed calls are missed income.',
          'An AI receptionist picks up every call, any time of day, and handles the routine ones completely. Calls that need you are summarised and sent to your phone, so you can call back with full context.',
        ],
      },
      {
        h2: 'What our AI receptionist handles',
        body: [],
        bullets: [
          'Answers calls 24/7 in a natural, professional voice',
          'Answers common questions about your services, prices and hours',
          'Books, reschedules and cancels appointments (Pro and Corporate)',
          'Connects to your calendar so bookings never clash',
          'Sends WhatsApp and SMS follow-ups to callers',
          'Records calls and sends you a written summary of each one',
        ],
      },
      {
        h2: 'Set up around your business',
        body: [
          'We start by learning how your front desk works today: the questions callers ask, how you take bookings and when a call must go to a person. Then we set up the receptionist with your real information, test it with sample calls and only put it live when it handles them properly.',
          'This is the same technology behind Sera Front Desk, our AI reception division, built for Zimbabwean businesses.',
        ],
      },
      {
        h2: 'Choose your plan',
        body: [],
        points: [
          { h3: 'Basic AI Automation', text: 'AI call answering around the clock for one business line, answers to customer FAQs and call summaries sent to WhatsApp.' },
          { h3: 'Pro AI Automation', text: 'A full AI receptionist with appointment booking, calendar integration, WhatsApp and SMS follow-ups, and call recordings with summaries.' },
          { h3: 'Corporate AI Automation', text: 'A multi-line AI call centre with custom workflows, CRM integration and multi-language support.' },
        ],
      },
    ],
    faqs: [
      { q: 'How much does an AI receptionist cost?', a: 'Basic AI call answering is $80 to set up and $25 a month. The full AI receptionist with bookings is $150 to set up and $45 a month. Multi-line call centres start at $250 with a monthly plan quoted.' },
      { q: 'Will callers know they are speaking to AI?', a: 'The receptionist speaks naturally, and we recommend it introduces itself as your virtual assistant. Honesty builds trust, and callers can always ask for a person.' },
      { q: 'Can it book appointments into my calendar?', a: 'Yes. On the Pro and Corporate plans it books, reschedules and cancels appointments directly in your calendar.' },
      { q: 'What happens with calls it cannot handle?', a: 'It takes the caller’s details and the reason for the call, then sends you a summary on WhatsApp so you can call back.' },
      { q: 'Does it work with my existing phone number?', a: 'In most cases yes, by forwarding calls from your number. We confirm what works with your line during setup.' },
    ],
    related: ['ai-chatbot-zimbabwe', 'ai-automation-zimbabwe', 'crm-business-dashboards-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like an AI receptionist for my business.',
    startHref: '/start?service=automation',
  },
  {
    slug: 'ai-automation-zimbabwe',
    name: 'AI automation',
    keyword: 'AI automation Zimbabwe',
    title: 'AI Automation for Zimbabwean Businesses | Kesera',
    description: 'Automate admin, reports, follow-ups and research with AI. Hire AI employees from Kesera Technologies, or get a custom automation for your workflow.',
    eyebrow: 'AI automation · Zimbabwe',
    h1: 'AI automation that takes busywork off your desk.',
    lead:
      'Copying data between spreadsheets, chasing invoices, writing the same report every Friday: this work matters, but it does not need you. We automate it with AI, either through ready-to-hire AI employees or a custom automation built around how your business runs.',
    plans: null,
    priceNote:
      'AI employees are $200 per employee per month, and your first employee is free for 30 days with no card needed. Custom automations are priced by scope: describe your workflow and we give you a fixed quote before any work starts.',
    sections: [
      {
        h2: 'Two ways to automate',
        body: [],
        points: [
          {
            h3: 'Hire an AI employee',
            text: 'Kesera AI Workforce gives you specialised AI employees for admin, sales, marketing, customer support, research and finance. You tell them what you need in plain language and they hand you finished, checked work: documents, spreadsheets, reports and draft replies.',
          },
          {
            h3: 'Get a custom automation',
            text: 'If you have a specific repeating process, such as orders arriving on WhatsApp that need to land in a spreadsheet and trigger an invoice, we design and build an automation for exactly that process.',
          },
        ],
      },
      {
        h2: 'Work that AI handles well',
        body: ['AI is strongest on repeatable work with clear rules. Our clients use it for:'],
        bullets: [
          'Turning messy spreadsheets into clean reports and invoices',
          'Researching suppliers, competitors and prices with sources',
          'Drafting customer replies from your own policies',
          'Planning social media content and campaigns',
          'Summarising meetings and keeping records organised',
        ],
      },
      {
        h2: 'You stay in charge',
        body: [
          'Automation should never mean losing control. Our AI employees ask for your approval before sending emails or acting on your behalf, they never make payments or ask for your passwords, and one button pauses everything. Every task shows its progress, so you can see exactly what was done.',
        ],
      },
      {
        h2: 'Start small, then grow',
        body: [
          'The best automation projects start with one painful job. Pick the task that eats the most hours each week, automate it, measure the time saved and then move to the next. With a free 30-day trial on your first AI employee, you can test it on your own work before spending anything.',
        ],
      },
    ],
    faqs: [
      { q: 'How much does AI automation cost in Zimbabwe?', a: 'AI employees cost $200 per employee per month, with your first employee free for 30 days. Custom automations are quoted by scope after we understand your workflow.' },
      { q: 'Will AI replace my staff?', a: 'AI takes over repetitive tasks so your staff can focus on customers, sales and decisions. Most businesses use it to do more with the team they have.' },
      { q: 'Is my business data safe?', a: 'Your data is used only for your work. AI employees connect to tools like Gmail and Google Drive through official sign-in and never ask for your passwords.' },
      { q: 'Do I need technical knowledge?', a: 'No. You describe the job in plain language, the same way you would brief a person.' },
      { q: 'Can I try it before paying?', a: 'Yes. Your first AI employee is free for 30 days, and no card is needed.' },
    ],
    related: ['ai-chatbot-zimbabwe', 'ai-receptionist-zimbabwe', 'crm-business-dashboards-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like to automate work in my business with AI.',
    startHref: '/start?service=automation',
  },
  {
    slug: 'crm-business-dashboards-zimbabwe',
    name: 'CRM and business dashboards',
    keyword: 'CRM software Zimbabwe',
    title: 'CRM Systems & Business Dashboards in Zimbabwe | Kesera',
    description: 'Custom CRM systems and live business dashboards for Zimbabwean companies, from $100. Track customers, sales and staff in one place. By Kesera Technologies.',
    eyebrow: 'CRM & dashboards · Zimbabwe',
    h1: 'CRM systems and dashboards that show you how your business is really doing.',
    lead:
      'Customer details in one phone, sales in a notebook, stock in a spreadsheet nobody trusts. We build CRM systems and live dashboards that bring your numbers together, so you can see what is selling, who your best customers are and where money is leaking.',
    plans: { group: 'crm' },
    priceNote: 'Three packages, in US dollars. Full business systems are priced by scope.',
    sections: [
      {
        h2: 'Why spreadsheets stop working',
        body: [
          'Spreadsheets are great until three people edit them, a file gets emailed around and nobody knows which version is right. Leads get forgotten, follow-ups slip and month-end reports take days. A CRM gives everyone one source of truth, with each person seeing what they need.',
        ],
      },
      {
        h2: 'What we can build for you',
        body: [],
        bullets: [
          'A sales and customer dashboard with live charts and reports',
          'Customer and lead tracking, so no enquiry is forgotten',
          'Staff accounts with roles, so people see only what they should',
          'Inventory, finance and HR modules for a full business system',
          'Connections to Excel, Google Sheets and the tools you already use',
        ],
      },
      {
        h2: 'Built around how you work',
        body: [
          'Off-the-shelf CRMs are built for American sales teams and priced in monthly dollars per user. We build systems around your actual process, whether that is a car dealership tracking leads, a farm tracking inputs and harvests or a distributor managing orders across towns. You own the system, and it grows as you do.',
          'Every system works on phones, so managers can check numbers from anywhere.',
        ],
      },
      {
        h2: 'Packages',
        body: [],
        points: [
          { h3: 'Basic CRM & Dashboards', text: 'A sales and customer dashboard with live charts and reports, connected to Excel or Google Sheets, with one month of support.' },
          { h3: 'Pro CRM & Dashboards', text: 'A custom CRM with customer and lead tracking, staff accounts and roles, live reports, data export and three months of support.' },
          { h3: 'Corporate CRM & Dashboards', text: 'A full business system covering inventory, finance and HR, connected to your tools, with advanced analytics.' },
        ],
      },
    ],
    faqs: [
      { q: 'How much does a CRM cost in Zimbabwe?', a: 'Our Basic CRM & Dashboards package starts at $100, the Pro custom CRM is $180, and full business systems start at $300, priced by scope.' },
      { q: 'Can it use my existing spreadsheets?', a: 'Yes. We can connect to Excel and Google Sheets, or move your existing data into the new system.' },
      { q: 'Do I pay per user every month?', a: 'No. Our CRM packages are once-off builds. Hosting and any ongoing support are agreed with you up front.' },
      { q: 'Can my staff use it on their phones?', a: 'Yes. Every system we build is mobile friendly.' },
      { q: 'Can the CRM connect to my website or online store?', a: 'Yes. Enquiries and orders from your website can flow straight into the CRM.' },
    ],
    related: ['ecommerce-website-zimbabwe', 'ai-automation-zimbabwe', 'app-development-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like a CRM or dashboard for my business.',
    startHref: '/start?service=software',
  },
];

export const servicePage = (slug: string) => SERVICE_PAGES.find((s) => s.slug === slug);
