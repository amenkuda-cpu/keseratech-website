import EnquiriesPage from '../enquiries/page';

export const dynamic = 'force-dynamic';

/** AI employee hire requests: the enquiries list, fixed to the AI Workforce form. */
export default async function HireRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <EnquiriesPage searchParams={Promise.resolve({ q, source: 'ai-workforce' })} />;
}
