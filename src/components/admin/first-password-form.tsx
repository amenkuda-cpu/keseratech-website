'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { firstPasswordAction } from '@/app/admin/actions';

const input = 'mt-1.5 block h-12 w-full rounded-xl border border-[#d5deeb] bg-[#f7faff] px-4 text-[#14213d] outline-none focus:border-[#1a86fa] focus:ring-4 focus:ring-[#1a86fa]/15';

export function FirstPasswordForm() {
  const [state, action, pending] = useActionState(firstPasswordAction, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-[#41506b]">Temporary password</span>
        <input name="current" type="password" required autoComplete="current-password" autoFocus className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-[#41506b]">New password</span>
        <input name="next" type="password" required minLength={10} autoComplete="new-password" className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-[#41506b]">Type it again</span>
        <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={input} />
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-sm font-medium text-[#b42323]">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1a86fa] to-[#0d3a8f] font-semibold text-white shadow-[0_10px_24px_-12px_#1a86fa] hover:brightness-110 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Save and open the dashboard
      </button>
    </form>
  );
}
