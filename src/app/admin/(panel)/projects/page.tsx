import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { listProjects } from '@/lib/db';
import { STATUS_LABEL, divisionBySlug } from '@/content/site';
import { toggleProjectPublishedAction } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminProjects() {
  await requireAdmin();
  const projects = await listProjects({ includeUnpublished: true });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-title">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-dim">
            Kesera Ventures and client projects. Published projects appear on the home page pipeline, the projects page and their division page.
          </p>
        </div>
        <Link href="/admin/projects/new" className="inline-flex h-10 items-center gap-2 rounded-sm bg-signal px-4 text-sm font-semibold text-white hover:bg-[#3a98ff]">
          <Plus className="size-4" /> New project
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-hair rounded-[6px] border border-hair">
        {projects.map((p) => (
          <li key={p.slug}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
              <Link href={`/admin/projects/${p.slug}`} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-1 hover:opacity-80">
                <span className="min-w-48 flex-1 font-medium text-white">{p.name}</span>
                <span className="text-sm text-dim">{p.kind === 'venture' ? 'Venture' : `Client${p.client ? ` · ${p.client}` : ''}`}</span>
                <span className="text-sm text-dim">{divisionBySlug(p.division)?.name}</span>
                <span className="text-sm text-dim">{STATUS_LABEL[p.status]}</span>
              </Link>
              <span className={`a-chip ${p.published ? 'bg-[#ecf8f2] text-[#0b7a55]' : 'bg-[#fff6e8] text-[#8a5a00]'}`}>{p.published ? 'Live on the site' : 'Draft'}</span>
              <form action={toggleProjectPublishedAction}>
                <input type="hidden" name="slug" value={p.slug} />
                <button className="a-btn-ghost">{p.published ? 'Unpublish' : 'Publish'}</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
