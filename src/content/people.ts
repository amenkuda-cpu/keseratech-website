// The human side of the site: the founder's note, team photos and client quotes.
//
// HOW TO EDIT
// - Photos: put the file in public/people/ (JPG or WebP, at least 1200 px wide) and set `photo` to
//   { src: '/people/your-file.jpg', alt: 'what the photo shows' }.
// - Anything with `placeholder: true` is shown on your computer and on Vercel preview links, clearly
//   marked, but never on the live site. Replace the text with the real thing and set `placeholder: false`.

export type PersonPhoto = { src: string; alt: string } | null;

/** Placeholders are visible everywhere except the live (production) site. */
export const SHOW_PLACEHOLDERS = process.env.VERCEL_ENV !== 'production';

export const FOUNDER = {
  name: 'Amen',
  role: 'Founder, Kesera Technologies',
  /** Photo next to the "Who we are" note on the home page and at the top of /work. */
  photo: null as PersonPhoto,
  /** First-person note on the home page. A draft: rewrite it in your own words. */
  note: [
    'Hi, I’m Amen. I started Kesera because I kept seeing everyday problems around me that good software could fix, and not enough people here building the fix.',
    'Most days we build websites, apps and systems for businesses. That work pays the bills and teaches us a lot.',
    'Alongside it we’re working on bigger things: farm irrigation that saves water, EV charging, homes made from shipping containers. Some are still early. We’d rather tell you that straight than dress it up.',
  ],
};

export type TeamMember = { name: string; role: string; photo: PersonPhoto; placeholder: boolean };

export const TEAM: TeamMember[] = [
  { name: 'Amen', role: 'Founder', photo: null, placeholder: true },
  { name: 'Team member', role: 'Role', photo: null, placeholder: true },
  { name: 'Team member', role: 'Role', photo: null, placeholder: true },
  { name: 'Team member', role: 'Role', photo: null, placeholder: true },
];

export type ClientQuote = { quote: string; name: string; business: string; placeholder: boolean };

/** Example wording only. Replace with what real clients actually said, with their permission. */
export const QUOTES: ClientQuote[] = [
  {
    quote: 'They took the time to understand how we actually take orders before building anything. The site does exactly what we needed.',
    name: 'Client name',
    business: 'Business, town',
    placeholder: true,
  },
  {
    quote: 'Quick to reply on WhatsApp, honest about what would take longer, and the finished shop looks great on a phone.',
    name: 'Client name',
    business: 'Business, town',
    placeholder: true,
  },
  {
    quote: 'We went from a Facebook page to a proper website with an admin we can update ourselves.',
    name: 'Client name',
    business: 'Business, town',
    placeholder: true,
  },
];

export const visibleQuotes = () => QUOTES.filter((q) => SHOW_PLACEHOLDERS || !q.placeholder);
export const visibleTeam = () => TEAM.filter((t) => SHOW_PLACEHOLDERS || !t.placeholder);
