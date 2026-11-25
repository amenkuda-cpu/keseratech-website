// Shared shapes for the search-focused pages (services, locations, blog).
// Copy rule for every file in this folder: plain, confident English, no em dashes, no keyword stuffing.

export type SeoSection = {
  h2: string;
  body: string[];
  bullets?: string[];
  /** Optional H3 sub-points under this section. */
  points?: { h3: string; text: string }[];
};

export type Faq = { q: string; a: string };
