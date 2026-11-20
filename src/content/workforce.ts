/** The Kesera AI Workforce line-up shown on keseratech.com. Mirrors the workforce app's catalogue. */
export const WORKFORCE = [
  {
    key: 'sarah',
    name: 'Sarah',
    title: 'AI Executive Assistant',
    accent: '#1a86fa',
    tagline: 'Keeps your days, inbox and paperwork in order.',
    does: ['Email organisation', 'Calendar and scheduling', 'Documents and meeting summaries', 'Routine reports'],
  },
  {
    key: 'alex',
    name: 'Alex',
    title: 'AI Sales Executive',
    accent: '#5fcb7e',
    tagline: 'Finds prospects, prepares proposals and keeps your pipeline moving.',
    does: ['Prospect research with sources', 'Proposals from your price list', 'Follow-up drafts', 'Pipeline reports'],
  },
  {
    key: 'maya',
    name: 'Maya',
    title: 'AI Marketing Manager',
    accent: '#d9a56e',
    tagline: 'Plans campaigns, writes copy and measures what works.',
    does: ['Campaign plans', 'Content calendars', 'Social and email copy', 'Competitor monitoring'],
  },
  {
    key: 'james',
    name: 'James',
    title: 'AI Customer Support Representative',
    accent: '#7fb4ff',
    tagline: 'Answers enquiries accurately and never leaves a customer waiting.',
    does: ['Replies from your own policies', 'Ticket classification', 'Complaint summaries', 'Escalations to your team'],
  },
  {
    key: 'daniel',
    name: 'Daniel',
    title: 'AI Research Analyst',
    accent: '#9c9bff',
    tagline: 'Turns questions into sourced, structured research.',
    does: ['Market and competitor research', 'Price and data collection', 'Sourced reports', 'Spreadsheets'],
  },
  {
    key: 'grace',
    name: 'Grace',
    title: 'AI Finance Administrator',
    accent: '#c6ee4a',
    tagline: 'Keeps invoices, expenses and spreadsheets accurate and organised.',
    does: ['Invoices with checked totals', 'Expense categorisation', 'Basic reconciliations', 'Financial summaries'],
  },
] as const;

export const WORKFORCE_PRICE_USD = 200;
