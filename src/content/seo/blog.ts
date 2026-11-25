// Blog articles at /blog/[slug]. Answer the questions Zimbabwean business owners actually search.
// To add an article: copy one entry, give it a new slug and date, and link it to the relevant services.
import type { Faq, SeoSection } from './types';

export type BlogPost = {
  slug: string;
  title: string;
  /** <title> tag, under 60 characters. */
  seoTitle: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  published: string;
  minutes: number;
  lead: string;
  sections: SeoSection[];
  faqs?: Faq[];
  services: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-much-does-a-website-cost-in-zimbabwe',
    title: 'How much does a website cost in Zimbabwe?',
    seoTitle: 'How Much Does a Website Cost in Zimbabwe? (2026)',
    description: 'Real website prices in Zimbabwe for 2026: what $150, $180 and $250 gets you, what drives the cost up, and the running costs nobody mentions.',
    published: '2026-11-25',
    minutes: 6,
    lead:
      'Ask five developers in Zimbabwe for a website price and you will get five very different answers, from $50 to several thousand dollars. Here is what actually drives the cost, what you should expect at each budget, and the questions to ask before you pay anyone.',
    sections: [
      {
        h2: 'The short answer',
        body: [
          'A professional small business website in Zimbabwe typically costs between $150 and $250 for the build, with bigger custom systems costing more. At Kesera Technologies our published prices are $150 for a Basic Website, $180 for the Pro Package with an online shop, and $250 for Full E-commerce with a business dashboard.',
          'Prices below that range usually mean a template with your logo swapped in. Prices well above it should come with features you genuinely need, such as custom systems, integrations or a large number of pages.',
        ],
      },
      {
        h2: 'What drives the price of a website',
        body: ['Five things decide most of the cost:'],
        points: [
          { h3: 'Number of pages', text: 'A three-page site (home, services, contact) is quicker to design and write than a twelve-page corporate site.' },
          { h3: 'Online selling', text: 'A shop with a product catalogue, cart, checkout and order notifications is more work than a brochure site.' },
          { h3: 'Payments', text: 'Accepting EcoCash, cards or other payments online requires setup and testing with a payment provider.' },
          { h3: 'Custom features', text: 'Bookings, customer accounts, dashboards and integrations with other systems add development time.' },
          { h3: 'Content', text: 'If you need the developer to write your text or source photos, budget for it. Having your content ready saves money.' },
        ],
      },
      {
        h2: 'The running costs nobody mentions',
        body: [
          'The build is a once-off cost, but a website also has running costs. Make sure any quote you receive is clear about them:',
        ],
        bullets: [
          'Domain name: your address, such as yourbusiness.co.zw or yourbusiness.com, renewed every year',
          'Hosting: where your site lives on the internet, usually paid monthly or yearly',
          'Business email: optional, but more professional than a Gmail address',
          'Changes and support after launch: some developers include a period of support, others charge per change',
        ],
      },
      {
        h2: 'Red flags when comparing quotes',
        body: [
          'Be careful of a developer who registers your domain in their own name, will not tell you who hosts your site, or cannot show you live websites they have built. You should own your domain and your content, and you should be able to move your site if you ever change developers.',
          'Ask to see real, live examples of their work. You can see ours on our work page, from a law firm to online stores and our own PocketJobs app.',
        ],
      },
      {
        h2: 'How to get the most from your budget',
        body: [
          'Start with what brings customers today: a clear site with your services, prices, location and a WhatsApp button. Add an online store or booking system when the business needs it. A good developer builds your site so it can grow, instead of being thrown away and rebuilt a year later.',
        ],
      },
    ],
    faqs: [
      { q: 'What is the cheapest website at Kesera Technologies?', a: 'Our Basic Website is $150 and includes a custom three-page design, mobile-friendly layout, basic search setup, logo integration and a contact form.' },
      { q: 'Is a website a once-off payment?', a: 'The build is once-off. The domain name and hosting are ongoing costs, and we explain them before you pay anything.' },
    ],
    services: ['website-design-zimbabwe', 'ecommerce-website-zimbabwe'],
  },
  {
    slug: 'do-i-need-a-website-if-i-have-a-facebook-page',
    title: 'Do I need a website if I already have a Facebook page?',
    seoTitle: 'Website or Facebook Page? A Guide for Zimbabwe',
    description: 'Many Zimbabwean businesses run on Facebook and WhatsApp alone. Here is what a website adds, when social media is enough, and how the two work together.',
    published: '2026-11-25',
    minutes: 5,
    lead:
      'Plenty of Zimbabwean businesses do well with a Facebook page, an Instagram account and a busy WhatsApp number. So is a website still worth paying for? For most growing businesses, yes, and the reason is not what you might think.',
    sections: [
      {
        h2: 'What social media does well',
        body: [
          'Social media is excellent for reaching people who already follow you, showing new stock, running promotions and starting conversations. It is free to start and your customers are already there. You should keep using it.',
        ],
      },
      {
        h2: 'What a Facebook page cannot do',
        body: [],
        points: [
          { h3: 'You do not own it', text: 'If your page is hacked, reported or restricted, years of followers and posts can disappear overnight. A website and its domain are yours.' },
          { h3: 'It is hard to find on Google', text: 'When someone searches for a service near them, Google mostly shows websites and Google Business Profiles, not Facebook posts.' },
          { h3: 'Information gets buried', text: 'Your prices, hours and delivery details sink below new posts within days. Customers end up asking the same questions over and over.' },
          { h3: 'It looks less established', text: 'Corporate buyers, NGOs and customers abroad often check for a website before they trust a supplier with a contract.' },
        ],
      },
      {
        h2: 'How a website and social media work together',
        body: [
          'The strongest setup uses both. Social media brings people in, and your website gives them a permanent, organised place to learn about you and take action: read your services, see prices, place an order or tap to chat on WhatsApp.',
          'Put your website link in your Facebook and Instagram bios and your WhatsApp Business profile. Every post and status then has somewhere useful to point.',
        ],
      },
      {
        h2: 'When social media alone is enough',
        body: [
          'If you are testing an idea, selling to a small circle of repeat customers, or only take orders in person, social media may be enough for now. Once you want new customers who do not already know you, or you want to look credible to bigger clients, a website pays for itself.',
        ],
      },
    ],
    services: ['website-design-zimbabwe', 'ai-chatbot-zimbabwe'],
  },
  {
    slug: 'can-an-ai-chatbot-answer-customers-on-whatsapp',
    title: 'Can an AI chatbot answer my customers on WhatsApp?',
    seoTitle: 'AI Chatbots on WhatsApp for Zimbabwean Businesses',
    description: 'How AI chatbots answer customers on WhatsApp for Zimbabwean businesses: what they handle well, what they should not do, and what they cost.',
    published: '2026-11-25',
    minutes: 5,
    lead:
      'If your phone buzzes all day with the same questions about prices, stock and opening hours, you have probably wondered whether a chatbot could answer them for you. It can, and modern AI chatbots are far better than the clunky menu bots of a few years ago.',
    sections: [
      {
        h2: 'How a WhatsApp AI chatbot works',
        body: [
          'An AI chatbot connects to your WhatsApp Business number and reads incoming messages. Instead of following a rigid menu, it understands questions written in normal language, such as "how much for delivery to Chitungwiza?", and answers using the information you have given it about your business.',
          'When a customer is ready to order or book, the bot collects their details and passes them to you. When a question is too complex, it hands the conversation to a person.',
        ],
      },
      {
        h2: 'What a chatbot handles well',
        body: [],
        bullets: [
          'Prices, opening hours, location and directions',
          'Product availability and delivery areas',
          'Taking orders and booking appointments',
          'Collecting names, numbers and enquiry details for follow-up',
          'Replying instantly at night and on weekends',
        ],
      },
      {
        h2: 'What it should not do',
        body: [
          'A good chatbot knows its limits. It should never make up an answer it does not have, promise something your business cannot deliver, or handle a complaint that needs a human touch. Ours are trained only on your real information and hand over to your team whenever they are unsure.',
          'You also stay in control: you can review conversations, update answers and switch the bot off at any time.',
        ],
      },
      {
        h2: 'What it costs',
        body: [
          'At Kesera Technologies, a Basic AI Chatbot is $40 to set up and $10 a month, and a Pro AI Chatbot with orders, bookings and human handover is $80 to set up and $20 a month. For most businesses that is less than the cost of one missed sale a month.',
        ],
      },
    ],
    faqs: [
      { q: 'Will my customers know they are talking to a bot?', a: 'We recommend the bot introduces itself as your virtual assistant. Being honest builds trust, and customers can always ask for a person.' },
      { q: 'Can I still reply myself?', a: 'Yes. You can step into any conversation, and the bot hands over automatically when a customer needs a person.' },
    ],
    services: ['ai-chatbot-zimbabwe', 'ai-receptionist-zimbabwe'],
  },
];

export const blogPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
