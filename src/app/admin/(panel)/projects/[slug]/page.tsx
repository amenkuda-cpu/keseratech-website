import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { getProject, listProjects, type Project } from '@/lib/db';
import { ProjectEditor } from '@/components/admin/project-editor';

export const dynamic = 'force-dynamic';

const BLANK: Project = {
  slug: '',
  name: '',
  kind: 'venture',
  division: 'sera-tech',
  status: 'RESEARCH',
  tagline: '',
  headline: '',
  summary: '',
  capabilities: [],
  sections: [],
  visual: 'none',
  client: null,
  featured: false,
  published: false,
  sort: 10,
};

export default async function AdminProject({ params }: PageProps<'/admin/projects/[slug]'>) {
  await requireAdmin();
  const { slug } = await params;
  const isNew = slug === 'new';
  const project = isNew ? { ...BLANK, sort: (await listProjects({ includeUnpublished: true })).length + 1 } : await getProject(slug, { includeUnpublished: true });
  if (!project) notFound();
  return (
    <>
      <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-dim hover:text-white">
        <ArrowLeft className="size-4" /> Projects
      </Link>
      <h1 className="t-title mt-4">{isNew ? 'New project' : project.name}</h1>
      <ProjectEditor initial={project} isNew={isNew} />
    </>
  );
}
