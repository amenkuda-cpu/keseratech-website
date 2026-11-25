// Location pages at /locations/[slug]. Each one is written for its own city: different reasons to
// get online, different industries, different practical details. Never copy one into another.
// Do not claim local clients or an office in a city unless it is true.
import type { Faq, SeoSection } from './types';

export type LocationPage = {
  slug: string;
  place: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  sections: SeoSection[];
  faqs: Faq[];
  /** Service pages to feature, most relevant first. */
  services: string[];
  whatsapp: string;
};

export const LOCATION_PAGES: LocationPage[] = [
  {
    slug: 'harare',
    place: 'Harare',
    title: 'Website Developer in Harare | Kesera Technologies',
    description: 'Websites, online stores, apps and AI chatbots for Harare businesses. Clear prices from $150, quick replies on WhatsApp and support after launch.',
    eyebrow: 'Harare',
    h1: 'A website developer for Harare businesses that need to stand out.',
    lead:
      'Harare is where competition is sharpest. Whether you run a firm in the CBD, a clinic in Avondale or a shop in Borrowdale, your customers compare you online before they ever call. We build websites, online stores and AI tools that help Harare businesses win that comparison.',
    sections: [
      {
        h2: 'Standing out in a crowded market',
        body: [
          'Search for almost any service in Harare and you will find dozens of options. The businesses that win are the ones with a fast, clear website, honest prices and an easy way to get in touch. A professional site signals that you are established, and a Google Business Profile puts you on the map when people search nearby.',
          'We design every site around what your Harare customers actually want to know first, whether that is your rates, your location and parking, your opening hours or how quickly you can deliver.',
        ],
      },
      {
        h2: 'What Harare businesses ask us for most',
        body: [],
        points: [
          { h3: 'Professional services sites', text: 'Law firms, consultancies, accountants and agencies that need credibility. We built the website for Ndoro Chambers, a Zimbabwean law firm, including its practice areas and consultation bookings.' },
          { h3: 'Online stores', text: 'Retailers and food and drink brands that want to take orders and payments without endless WhatsApp back-and-forth.' },
          { h3: 'AI receptionists and chatbots', text: 'Busy clinics, salons and offices that miss calls and messages during peak hours.' },
          { h3: 'Dashboards and CRMs', text: 'Growing companies that have outgrown spreadsheets and need one view of sales and customers.' },
        ],
      },
      {
        h2: 'Working together from Marondera',
        body: [
          'Our base is in Marondera, about 75 km east of Harare. Most projects run smoothly over WhatsApp, calls and video meetings, and we can arrange an in-person meeting in Harare when a project needs one. You get direct contact with the people building your site, not a call centre.',
        ],
      },
    ],
    faqs: [
      { q: 'Do you have an office in Harare?', a: 'We are based in Marondera and work with Harare clients over WhatsApp, calls and video meetings. We can meet in person in Harare when a project needs it.' },
      { q: 'How much does a website cost in Harare?', a: 'Our prices are the same everywhere in Zimbabwe: websites from $150, online stores from $180 and full e-commerce with a dashboard from $250.' },
      { q: 'Can you help my Harare business show up on Google Maps?', a: 'Yes. We can set up and optimise your Google Business Profile alongside your website so you appear in local searches.' },
    ],
    services: ['website-design-zimbabwe', 'ecommerce-website-zimbabwe', 'ai-receptionist-zimbabwe', 'crm-business-dashboards-zimbabwe'],
    whatsapp: 'Hi Kesera, I run a business in Harare and would like a website.',
  },
  {
    slug: 'marondera',
    place: 'Marondera',
    title: 'Website Design in Marondera | Kesera Technologies',
    description: 'Kesera Technologies is based in Marondera. Websites, online stores, apps and AI for local businesses, with face-to-face meetings and prices from $150.',
    eyebrow: 'Marondera · Our home base',
    h1: 'Website design in Marondera, from a team based right here.',
    lead:
      'Kesera Technologies is a Marondera company. When you hire us, you are working with a local team you can meet face to face, that understands Mashonaland East and wants to see businesses in this town grow.',
    sections: [
      {
        h2: 'Why a website matters for a Marondera business',
        body: [
          'Marondera sits on the main road between Harare and Mutare, with farms, schools, lodges and shops that serve both locals and people passing through. Travellers, parents and farm buyers search online before they stop or call. A clear website with your location, services and contact details turns those searches into customers.',
          'It also lets a local business sell beyond the town. A farm supplier, a craft maker or a food brand in Marondera can take orders from Harare, Mutare and further afield through an online store.',
        ],
      },
      {
        h2: 'Built for local businesses',
        body: [],
        points: [
          { h3: 'Farms and agribusiness', text: 'Websites and online stores for produce, inputs and services. Our AgriSera division also builds smart irrigation technology, so we speak the language of agriculture.' },
          { h3: 'Schools and churches', text: 'Clear sites for announcements, events, admissions and contact details. We built the website for Oasis Family Ministries.' },
          { h3: 'Lodges, shops and services', text: 'Sites that show your rooms, products or services with prices, directions and one-tap WhatsApp.' },
        ],
      },
      {
        h2: 'Meet us in person',
        body: [
          'Some things are easier across a table. Because we are based in Marondera, we can sit down with you to plan your website, take photos of your business and show you how to manage your site after launch. Everything else runs over WhatsApp, so you always know where your project stands.',
        ],
      },
    ],
    faqs: [
      { q: 'Are you really based in Marondera?', a: 'Yes. Kesera Technologies is based in Marondera and works with businesses across Zimbabwe and abroad.' },
      { q: 'Can we meet face to face?', a: 'Yes. For Marondera businesses we can meet in person to plan your project and walk you through your finished site.' },
      { q: 'What does a website cost?', a: 'Websites start at $150, online stores at $180 and full e-commerce with a business dashboard at $250, in US dollars.' },
    ],
    services: ['website-design-zimbabwe', 'ecommerce-website-zimbabwe', 'ai-chatbot-zimbabwe', 'app-development-zimbabwe'],
    whatsapp: 'Hi Kesera, I am in Marondera and would like a website for my business.',
  },
  {
    slug: 'bulawayo',
    place: 'Bulawayo',
    title: 'Website Design in Bulawayo | Kesera Technologies',
    description: 'Websites, online stores, apps and AI tools for Bulawayo businesses. Fixed prices from $150, remote project management on WhatsApp and full support.',
    eyebrow: 'Bulawayo',
    h1: 'Website design for Bulawayo businesses ready to grow.',
    lead:
      'Bulawayo has a proud history of manufacturing, trade and enterprise, and its businesses deserve to be found online as easily as any in Harare. We build websites, online stores and business systems for Bulawayo companies, managed remotely with clear communication throughout.',
    sections: [
      {
        h2: 'Get found by customers across the country',
        body: [
          'Zimbabwe’s second city serves the whole of Matabeleland and trades with Botswana and South Africa. A strong website lets a Bulawayo manufacturer, distributor or service company win customers far beyond the city, and gives buyers outside Zimbabwe a professional first impression.',
        ],
      },
      {
        h2: 'What we build for Bulawayo companies',
        body: [],
        points: [
          { h3: 'Company and industrial websites', text: 'Clear sites for manufacturers, engineering firms and suppliers, showing capabilities, products and how to request a quote.' },
          { h3: 'Online stores and catalogues', text: 'Product catalogues with ordering for wholesalers and retailers serving customers across the region.' },
          { h3: 'CRMs and dashboards', text: 'Systems to track customers, orders and stock across branches, so management sees everything in one place.' },
          { h3: 'AI chatbots', text: 'WhatsApp bots that answer enquiries around the clock, so no customer waits for a reply.' },
        ],
      },
      {
        h2: 'How remote projects work',
        body: [
          'We work with Bulawayo clients the way we work with clients abroad: a scoping call, a written price and timeline, designs shared for your comments, and regular progress updates on WhatsApp. You never have to chase us for news. If a project needs a visit, we arrange it with you in advance.',
          'Our site content is written in English. If you want pages in isiNdebele for your customers, tell us and we will plan the translation into the project.',
        ],
      },
    ],
    faqs: [
      { q: 'Can you build my website if I am in Bulawayo?', a: 'Yes. Most of our projects run remotely over WhatsApp, calls and video meetings, so distance is not a problem.' },
      { q: 'Can my website have isiNdebele pages?', a: 'Yes. We can plan a bilingual site with you. We have already built a bilingual English and Portuguese site for Uptime Africa Group.' },
      { q: 'What are your prices?', a: 'The same across Zimbabwe: websites from $150, online stores from $180 and full e-commerce with a dashboard from $250.' },
    ],
    services: ['website-design-zimbabwe', 'crm-business-dashboards-zimbabwe', 'ecommerce-website-zimbabwe', 'ai-chatbot-zimbabwe'],
    whatsapp: 'Hi Kesera, I run a business in Bulawayo and would like a website.',
  },
  {
    slug: 'zimbabwe',
    place: 'Zimbabwe',
    title: 'Affordable Websites Across Zimbabwe | Kesera Technologies',
    description: 'Affordable websites, online stores, apps and AI for businesses anywhere in Zimbabwe, from $150. Mutare, Gweru, Masvingo and beyond, all handled remotely.',
    eyebrow: 'Zimbabwe-wide',
    h1: 'Affordable websites for businesses anywhere in Zimbabwe.',
    lead:
      'From Mutare to Victoria Falls, Gweru to Masvingo, every Zimbabwean business should be able to get a professional website at a fair price. We work with clients across the country and in the diaspora, with clear packages and no surprises.',
    sections: [
      {
        h2: 'Affordable does not mean cheap',
        body: [
          'Our websites start at $150, and that price includes a custom design, a layout that works on phones, basic search engine setup and a contact form. We keep prices fair by focusing on what actually brings you customers, not on padding a quote. The price you see is the price you pay.',
        ],
      },
      {
        h2: 'One team for every stage of growth',
        body: ['As your business grows, your technology can grow with you instead of being replaced.'],
        points: [
          { h3: 'Start with a website', text: 'A clear, professional presence so customers can find and trust you.' },
          { h3: 'Add an online store', text: 'Take orders and payments through EcoCash, cards or cash on delivery.' },
          { h3: 'Automate with AI', text: 'Chatbots, AI receptionists and AI employees that handle routine work.' },
          { h3: 'Run it from a dashboard', text: 'CRMs and dashboards that bring your sales, customers and stock together.' },
        ],
      },
      {
        h2: 'Serving the diaspora too',
        body: [
          'Many Zimbabweans abroad run or fund businesses at home. We work with diaspora clients over WhatsApp and video, so you can get a site built for a family business in Zimbabwe without being in the country.',
        ],
      },
    ],
    faqs: [
      { q: 'Do you work with businesses outside Harare and Bulawayo?', a: 'Yes. We work with businesses anywhere in Zimbabwe, from Mutare and Gweru to Masvingo and Victoria Falls, and with clients abroad.' },
      { q: 'What is the cheapest website you offer?', a: 'Our Basic Website is $150. It includes a custom three-page design, mobile-friendly layout, basic search setup, logo integration and a contact form.' },
      { q: 'How do we communicate if we never meet?', a: 'Through WhatsApp, calls and video meetings. You get a written price and timeline, and regular updates as your project moves forward.' },
    ],
    services: ['website-design-zimbabwe', 'ecommerce-website-zimbabwe', 'ai-automation-zimbabwe', 'app-development-zimbabwe'],
    whatsapp: 'Hi Kesera, I would like a website for my business in Zimbabwe.',
  },
];

export const locationPage = (slug: string) => LOCATION_PAGES.find((l) => l.slug === slug);
