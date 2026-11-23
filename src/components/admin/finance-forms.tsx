'use client';

import { useActionState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { addRevenueAction, setTargetAction } from '@/app/admin/actions';

type Result = { ok: true; message?: string } | { ok: false; error: string } | undefined;

function Msg({ state }: { state: Result }) {
  if (!state) return null;
  return state.ok ? <p role="status" className="text-sm font-medium text-[#0b7a55]">{state.message}</p> : <p role="alert" className="text-sm font-medium text-[#b42323]">{state.error}</p>;
}

const label = 'text-[12.5px] font-semibold text-[#41506b]';

export function AddPaymentForm({ today, categories, methods }: { today: string; categories: readonly string[]; methods: readonly string[] }) {
  const [state, action, pending] = useActionState(addRevenueAction, undefined);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2" key={state?.ok ? state.message : 'add'}>
      <label className="sm:col-span-2">
        <span className={label}>Who paid</span>
        <input name="client" required placeholder="e.g. Uptime Africa Group" className="a-input mt-1" />
      </label>
      <label>
        <span className={label}>Amount (USD)</span>
        <input name="amount" required inputMode="decimal" type="number" min="0.01" step="0.01" placeholder="100.00" className="a-input mt-1" />
      </label>
      <label>
        <span className={label}>Date received</span>
        <input name="receivedOn" required type="date" defaultValue={today} max={today} className="a-input mt-1" />
      </label>
      <label>
        <span className={label}>For</span>
        <select name="category" className="a-input mt-1" defaultValue={categories[0]}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Paid by</span>
        <select name="method" className="a-input mt-1" defaultValue={methods[0]}>
          {methods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className={label}>Note (optional)</span>
        <input name="note" placeholder="Invoice number, what it was for…" className="a-input mt-1" />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="a-btn disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Record payment
        </button>
        <Msg state={state} />
      </div>
    </form>
  );
}

export function TargetForm({ amount, deadline }: { amount: number; deadline: string }) {
  const [state, action, pending] = useActionState(setTargetAction, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="w-32">
        <span className={label}>Target (USD)</span>
        <input name="amount" type="number" min="1" step="1" defaultValue={amount} className="a-input mt-1" />
      </label>
      <label className="w-40">
        <span className={label}>By</span>
        <input name="deadline" type="date" defaultValue={deadline} className="a-input mt-1" />
      </label>
      <button disabled={pending} className="h-[2.6rem] rounded-full border border-[#cfdcee] bg-white px-4 text-sm font-semibold text-[#0d3a8f] hover:bg-[#f2f7ff] disabled:opacity-60">
        {pending ? 'Saving…' : 'Save target'}
      </button>
      <Msg state={state} />
    </form>
  );
}
