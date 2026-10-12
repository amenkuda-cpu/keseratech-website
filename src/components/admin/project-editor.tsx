'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { deleteProjectAction, saveProjectAction } from '@/app/admin/actions';
import type { Project } from '@/lib/db';
import { DIVISIONS, STATUSES, STATUS_LABEL } from '@/content/site';
import { AreaField, NumberField, SaveBar, TextField, Toggle } from './fields';

const select = 'mt-1.5 block h-10 w-full rounded-sm border border-input bg-deep px-3 text-sm text-white';
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function ProjectEditor({ initial, isNew }: { initial: Project; isNew: boolean }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);
  const set = (patch: Partial<Project>) => {
    setResult(null);
    setP((x) => ({ ...x, ...patch }));
  };

  return (
    <div className="mt-8 space-y-8">
      <section className="grid gap-4 rounded-[6px] border border-hair p-4 md:grid-cols-2">
        <TextField label="Name" value={p.name} onChange={(v) => set({ name: v, ...(isNew && (!p.slug || p.slug === slugify(p.name)) ? { slug: slugify(v) } : {}) })} />
        <TextField label="Web address" value={p.slug} onChange={(v) => set({ slug: slugify(v) })} hint={`keseratech.com/projects/${p.slug || '…'}`} />
        <div>
          <label className="text-xs text-dim" htmlFor="kind">Kind</label>
          <select id="kind" className={select} value={p.kind} onChange={(e) => set({ kind: e.target.value as Project['kind'] })}>
            <option value="venture">Kesera venture (our own product)</option>
            <option value="client">Client project</option>
          </select>
        </div>
        {p.kind === 'client' && <TextField label="Client name (shown publicly; only with their permission)" value={p.client ?? ''} onChange={(v) => set({ client: v.trim() ? v : null })} />}
        <div>
          <label className="text-xs text-dim" htmlFor="division">Division</label>
          <select id="division" className={select} value={p.division} onChange={(e) => set({ division: e.target.value as Project['division'] })}>
            {DIVISIONS.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-dim" htmlFor="status">Status</label>
          <select id="status" className={select} value={p.status} onChange={(e) => set({ status: e.target.value as Project['status'] })}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-dim" htmlFor="visual">Schematic</label>
          <select id="visual" className={select} value={p.visual} onChange={(e) => set({ visual: e.target.value as Project['visual'] })}>
            <option value="none">None</option>
            <option value="delivery">Delivery map</option>
            <option value="irrigation">Irrigation field</option>
            <option value="ev">EV charging network</option>
            <option value="upcycle">Waste to homes and furniture</option>
            <option value="marketplace">Jobs marketplace</option>
          </select>
        </div>
        <NumberField label="Order" value={p.sort} step={1} onChange={(v) => set({ sort: Math.round(v) })} />
        <div className="flex flex-wrap gap-x-6 md:col-span-2">
          <Toggle label="Published" checked={p.published} onChange={(v) => set({ published: v })} />
          <Toggle label="Feature on the home page (max 5 shown)" checked={p.featured} onChange={(v) => set({ featured: v })} />
        </div>
      </section>

      <section className="grid gap-4 rounded-[6px] border border-hair p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Website (optional)" value={p.links?.website ?? ''} onChange={(v) => set({ links: { ...p.links, website: v.trim() || null } })} placeholder="https://" />
          <TextField label="App Store link (optional)" value={p.links?.appStore ?? ''} onChange={(v) => set({ links: { ...p.links, appStore: v.trim() || null } })} placeholder="https://apps.apple.com/…" />
          <TextField label="Google Play link (optional)" value={p.links?.googlePlay ?? ''} onChange={(v) => set({ links: { ...p.links, googlePlay: v.trim() || null } })} placeholder="https://play.google.com/…" />
        </div>
        <TextField label="Tagline" value={p.tagline} onChange={(v) => set({ tagline: v })} hint="Short line, e.g. “Delivery + parcels + errands”" />
        <AreaField label="Headline (each line on its own line)" rows={3} value={p.headline} onChange={(v) => set({ headline: v })} />
        <AreaField label="Summary" rows={4} value={p.summary} onChange={(v) => set({ summary: v })} hint="Describe what is being built and where it stands. No launch dates, user numbers or results until they are real." />
        <AreaField label="What it does (one per line)" rows={6} value={p.capabilities.join('\n')} onChange={(v) => set({ capabilities: v.split('\n').map((s) => s.trim()).filter(Boolean) })} />
      </section>

      <section className="rounded-[6px] border border-hair p-4">
        <div className="flex items-center justify-between">
          <p className="t-label text-white">Story sections</p>
          <button type="button" onClick={() => set({ sections: [...p.sections, { title: '', text: '' }] })} className="inline-flex h-9 items-center gap-2 rounded-sm border border-hair px-3 text-sm text-dim hover:text-white">
            <Plus className="size-4" /> Add section
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {p.sections.map((s, i) => (
            <div key={i} className="grid gap-2 rounded-sm border border-hair p-3">
              <TextField label="Title" value={s.title} onChange={(v) => set({ sections: p.sections.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
              <AreaField label="Text" rows={4} value={s.text} onChange={(v) => set({ sections: p.sections.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
              <button type="button" onClick={() => set({ sections: p.sections.filter((_, j) => j !== i) })} className="inline-flex items-center gap-1.5 justify-self-start text-sm text-faint hover:text-destructive">
                <Trash2 className="size-3.5" /> Remove section
              </button>
            </div>
          ))}
          {p.sections.length === 0 && <p className="text-sm text-faint">No sections yet.</p>}
        </div>
      </section>

      {!isNew && (
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(`Delete “${saved.name}” from the website? This can’t be undone.`)) return;
            start(async () => {
              await deleteProjectAction(saved.slug);
              router.push('/admin/projects');
            });
          }}
          className="inline-flex items-center gap-2 text-sm text-faint hover:text-destructive"
        >
          <Trash2 className="size-4" /> Delete project
        </button>
      )}

      <SaveBar
        dirty={dirty || isNew}
        pending={pending}
        result={result}
        onReset={() => { setP(saved); setResult(null); }}
        onSave={() =>
          start(async () => {
            const res = await saveProjectAction(p, isNew ? null : saved.slug);
            if (!res.ok) return setResult({ ok: false, text: res.error });
            setSaved(p);
            setResult({ ok: true, text: res.message ?? 'Saved.' });
            if (isNew || p.slug !== saved.slug) router.replace(`/admin/projects/${p.slug}`);
          })
        }
      />
    </div>
  );
}
