import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { getEstimator, getPlans } from '@/lib/db';
import { EstimatorEditor, PlansEditor } from '@/components/admin/pricing-editor';

export const dynamic = 'force-dynamic';

export default async function AdminPricing({ searchParams }: PageProps<'/admin/pricing'>) {
  await requireAdmin();
  const tab = (await searchParams).tab === 'estimator' ? 'estimator' : 'plans';
  return (
    <>
      <h1 className="t-title">Pricing</h1>
      <p className="mt-2 max-w-2xl text-sm text-dim">
        Changes go live on the website as soon as you save. Plans marked “proposal” are prices that still need the owner’s confirmation; they show publicly like any other price.
      </p>
      <div className="mt-6 flex gap-1" role="tablist">
        <Link href="/admin/pricing" role="tab" aria-selected={tab === 'plans'} className={`rounded-sm px-3 py-2 text-sm ${tab === 'plans' ? 'bg-white/10 text-white' : 'text-dim hover:text-white'}`}>Packages</Link>
        <Link href="/admin/pricing?tab=estimator" role="tab" aria-selected={tab === 'estimator'} className={`rounded-sm px-3 py-2 text-sm ${tab === 'estimator' ? 'bg-white/10 text-white' : 'text-dim hover:text-white'}`}>Estimator rates</Link>
      </div>
      {tab === 'plans' ? <PlansEditor initial={await getPlans()} /> : <EstimatorEditor initial={await getEstimator()} />}
    </>
  );
}
