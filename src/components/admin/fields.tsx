'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

const box = 'mt-1.5 block w-full rounded-sm border border-input bg-deep px-3 text-sm text-white outline-none focus:border-signal';

export function TextField({ label, value, onChange, className, hint, ...rest }: { label: string; value: string; onChange: (v: string) => void; className?: string; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs text-dim">{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(box, 'h-10')} {...rest} />
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export function AreaField({ label, value, onChange, rows = 4, className, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; className?: string; hint?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs text-dim">{label}</label>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cn(box, 'py-2 leading-relaxed')} />
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

/** Whole or decimal dollars in the UI, integer cents in the data. */
export function MoneyField({ label, cents, onChange, className }: { label: string; cents: number; onChange: (cents: number) => void; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs text-dim">{label}</label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">$</span>
        <input
          id={id}
          type="number"
          min={0}
          step="1"
          inputMode="decimal"
          value={Number.isFinite(cents) ? cents / 100 : ''}
          onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value || 0) * 100)))}
          className={cn(box, 'mt-0 h-10 pl-7 tabular-nums')}
        />
      </div>
    </div>
  );
}

export function NumberField({ label, value, onChange, step = 0.05, min, max, className }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs text-dim">{label}</label>
      <input id={id} type="number" step={step} min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className={cn(box, 'h-10 tabular-nums')} />
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[#1a86fa]" />
      {label}
    </label>
  );
}

export function SaveBar({ dirty, pending, result, onSave, onReset }: { dirty: boolean; pending: boolean; result: { ok: boolean; text: string } | null; onSave: () => void; onReset: () => void }) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-10 border-t border-hair bg-void/95 px-4 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className={cn('text-sm', result ? (result.ok ? 'text-[#5fcb7e]' : 'text-destructive') : 'text-dim')}>
          {result?.text ?? (dirty ? 'Unsaved changes.' : 'Everything is saved.')}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onReset} disabled={!dirty || pending} className="h-10 rounded-sm border border-hair px-4 text-sm text-dim hover:text-white disabled:opacity-40">Discard</button>
          <button type="button" onClick={onSave} disabled={!dirty || pending} className="h-10 rounded-sm bg-signal px-5 text-sm font-semibold text-white hover:bg-[#3a98ff] disabled:opacity-40">
            {pending ? 'Saving…' : 'Save and publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
