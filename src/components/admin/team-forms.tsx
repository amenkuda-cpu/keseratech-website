'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { addAdminAction, changeMyPasswordAction } from '@/app/admin/actions';

const input = 'mt-2 block h-11 w-full rounded-[6px] border border-input bg-deep px-4 text-white outline-none focus:border-signal';
const button = 'inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-signal px-5 text-sm font-semibold text-white hover:bg-[#3a98ff] disabled:opacity-70';

function Result({ state }: { state: { ok: true; message?: string } | { ok: false; error: string } | undefined }) {
  if (!state) return null;
  return state.ok ? <p role="status" className="text-sm text-emerald-400">{state.message}</p> : <p role="alert" className="text-sm text-destructive">{state.error}</p>;
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState(addAdminAction, undefined);
  return (
    <form action={action} className="mt-5 space-y-4" key={state?.ok ? Date.now() : 'form'}>
      <div>
        <label htmlFor="new-name" className="text-sm font-medium">Name</label>
        <input id="new-name" name="name" required className={input} />
      </div>
      <div>
        <label htmlFor="new-email" className="text-sm font-medium">Email</label>
        <input id="new-email" name="email" type="email" required autoCapitalize="none" spellCheck={false} className={input} />
      </div>
      <div>
        <label htmlFor="new-password" className="text-sm font-medium">Starting password</label>
        <input id="new-password" name="password" type="password" required autoComplete="new-password" className={input} />
      </div>
      <Result state={state} />
      <button type="submit" disabled={pending} className={button}>
        {pending && <Loader2 className="size-4 animate-spin" />} Add admin
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeMyPasswordAction, undefined);
  return (
    <form action={action} className="mt-5 space-y-4" key={state?.ok ? Date.now() : 'form'}>
      <div>
        <label htmlFor="current" className="text-sm font-medium">Current password</label>
        <input id="current" name="current" type="password" required autoComplete="current-password" className={input} />
      </div>
      <div>
        <label htmlFor="next" className="text-sm font-medium">New password</label>
        <input id="next" name="next" type="password" required autoComplete="new-password" className={input} />
      </div>
      <Result state={state} />
      <button type="submit" disabled={pending} className={button}>
        {pending && <Loader2 className="size-4 animate-spin" />} Change password
      </button>
    </form>
  );
}
