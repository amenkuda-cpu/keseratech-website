'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { saveEstimatorAction, savePlansAction } from '@/app/admin/actions';
import type { EstimatorConfig, EstimableService, Plan, PlanGroup } from '@/lib/pricing';
import { AreaField, MoneyField, NumberField, SaveBar, TextField, Toggle } from './fields';

export function PlansEditor({ initial }: { initial: Plan[] }) {
  const [plans, setPlans] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(plans) !== JSON.stringify(saved);

  const update = (id: string, patch: Partial<Plan>) => {
    setResult(null);
    setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const add = (group: PlanGroup) => {
    const n = plans.filter((p) => p.group === group).length + 1;
    setPlans((ps) => [...ps, { id: `${group}-plan-${Date.now().toString(36)}`, group, name: 'New plan', priceCents: 0, plus: false, from: group === 'app', blurb: '', features: [], highlight: null, sort: n, proposal: true }]);
  };

  return (
    <>
      {(['website', 'app'] as const).map((group) => (
        <section key={group} className="mt-10" aria-labelledby={`g-${group}`}>
          <div className="flex items-center justify-between">
            <h2 id={`g-${group}`} className="t-label text-white">{group === 'website' ? 'Website packages' : 'App packages'}</h2>
            <button type="button" onClick={() => add(group)} className="inline-flex h-9 items-center gap-2 rounded-sm border border-hair px-3 text-sm text-dim hover:text-white">
              <Plus className="size-4" /> Add plan
            </button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {plans.filter((p) => p.group === group).sort((a, b) => a.sort - b.sort).map((p) => (
              <fieldset key={p.id} className="rounded-[6px] border border-hair p-4">
                <legend className="sr-only">{p.name}</legend>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-white">{p.name}</p>
                  {p.proposal && <span className="t-label rounded-sm bg-[#ffb547]/15 px-2 py-1 text-[#ffb547]">Proposal: confirm price</span>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <TextField label="Name" value={p.name} onChange={(v) => update(p.id, { name: v })} className="col-span-2" />
                  <MoneyField label="Price (USD)" cents={p.priceCents} onChange={(c) => update(p.id, { priceCents: c })} />
                  <NumberField label="Order" value={p.sort} step={1} onChange={(v) => update(p.id, { sort: Math.round(v) })} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5">
                  <Toggle label="Show “From”" checked={p.from} onChange={(v) => update(p.id, { from: v })} />
                  <Toggle label="Show “+”" checked={p.plus} onChange={(v) => update(p.id, { plus: v })} />
                  <Toggle label="Price still a proposal" checked={p.proposal} onChange={(v) => update(p.id, { proposal: v })} />
                </div>
                <TextField label="Highlight label (blank for none)" value={p.highlight ?? ''} onChange={(v) => update(p.id, { highlight: v.trim() ? v : null })} className="mt-2" />
                <TextField label="Short description" value={p.blurb} onChange={(v) => update(p.id, { blurb: v })} className="mt-3" />
                <AreaField label="Included (one per line)" rows={5} value={p.features.join('\n')} onChange={(v) => update(p.id, { features: v.split('\n').map((s) => s.trim()).filter(Boolean) })} className="mt-3" />
                <button type="button" onClick={() => setPlans((ps) => ps.filter((x) => x.id !== p.id))} className="mt-3 inline-flex items-center gap-1.5 text-sm text-faint hover:text-destructive">
                  <Trash2 className="size-3.5" /> Remove plan
                </button>
              </fieldset>
            ))}
          </div>
        </section>
      ))}
      <SaveBar
        dirty={dirty}
        pending={pending}
        result={result}
        onReset={() => { setPlans(saved); setResult(null); }}
        onSave={() =>
          start(async () => {
            const res = await savePlansAction(plans);
            if (res.ok) setSaved(plans);
            setResult(res.ok ? { ok: true, text: res.message ?? 'Saved.' } : { ok: false, text: res.error });
          })
        }
      />
    </>
  );
}

const SERVICE_ORDER: EstimableService[] = ['website', 'app', 'software', 'webapp', 'automation'];

export function EstimatorEditor({ initial }: { initial: EstimatorConfig }) {
  const [config, setConfig] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(config) !== JSON.stringify(saved);

  const setService = (s: EstimableService, fn: (svc: EstimatorConfig['services'][EstimableService]) => EstimatorConfig['services'][EstimableService]) => {
    setResult(null);
    setConfig((c) => ({ ...c, services: { ...c.services, [s]: fn(c.services[s]) } }));
  };

  return (
    <>
      <div className="mt-10 space-y-4">
        {SERVICE_ORDER.map((s) => {
          const svc = config.services[s];
          return (
            <details key={s} className="rounded-[6px] border border-hair p-4" open={s === 'software'}>
              <summary className="cursor-pointer font-medium text-white">{svc.label}</summary>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="t-label text-faint">Project types (base price)</p>
                  <div className="mt-2 space-y-2">
                    {svc.types.map((t, i) => (
                      <div key={t.id} className="grid grid-cols-[1fr_8rem] gap-2">
                        <TextField label="Label" value={t.label} onChange={(v) => setService(s, (x) => ({ ...x, types: x.types.map((y, j) => (j === i ? { ...y, label: v } : y)) }))} />
                        <MoneyField label="Base" cents={t.cents} onChange={(c) => setService(s, (x) => ({ ...x, types: x.types.map((y, j) => (j === i ? { ...y, cents: c } : y)) }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="t-label text-faint">Features (added to the base)</p>
                  <div className="mt-2 space-y-2">
                    {svc.features.map((f, i) => (
                      <div key={f.id} className="grid grid-cols-[1fr_8rem] gap-2">
                        <TextField label="Label" value={f.label} onChange={(v) => setService(s, (x) => ({ ...x, features: x.features.map((y, j) => (j === i ? { ...y, label: v } : y)) }))} />
                        <MoneyField label="Adds" cents={f.cents} onChange={(c) => setService(s, (x) => ({ ...x, features: x.features.map((y, j) => (j === i ? { ...y, cents: c } : y)) }))} />
                      </div>
                    ))}
                  </div>
                  <NumberField label="Range spread (top of range = low × this)" value={svc.spread} min={1} max={3} onChange={(v) => setService(s, (x) => ({ ...x, spread: v }))} className="mt-4 max-w-xs" />
                </div>
              </div>
            </details>
          );
        })}

        <div className="grid gap-4 lg:grid-cols-2">
          <fieldset className="rounded-[6px] border border-hair p-4">
            <legend className="px-1 font-medium text-white">Number of users (software and web apps)</legend>
            <div className="mt-2 space-y-2">
              {config.userTiers.map((u, i) => (
                <NumberField key={u.id} label={`${u.label}: multiplier`} value={u.multiplier} min={0.5} max={3} onChange={(v) => { setResult(null); setConfig((c) => ({ ...c, userTiers: c.userTiers.map((y, j) => (j === i ? { ...y, multiplier: v } : y)) })); }} />
              ))}
            </div>
          </fieldset>
          <fieldset className="rounded-[6px] border border-hair p-4">
            <legend className="px-1 font-medium text-white">Timeline</legend>
            <div className="mt-2 space-y-2">
              {config.timelines.map((t, i) => (
                <NumberField key={t.id} label={`${t.label}: multiplier`} value={t.multiplier} min={0.5} max={3} onChange={(v) => { setResult(null); setConfig((c) => ({ ...c, timelines: c.timelines.map((y, j) => (j === i ? { ...y, multiplier: v } : y)) })); }} />
              ))}
            </div>
          </fieldset>
        </div>
      </div>
      <SaveBar
        dirty={dirty}
        pending={pending}
        result={result}
        onReset={() => { setConfig(saved); setResult(null); }}
        onSave={() =>
          start(async () => {
            const res = await saveEstimatorAction(config);
            if (res.ok) setSaved(config);
            setResult(res.ok ? { ok: true, text: res.message ?? 'Saved.' } : { ok: false, text: res.error });
          })
        }
      />
    </>
  );
}
