'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { login } from '@/app/admin/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          aria-invalid={!!state?.error}
          aria-describedby={state?.error ? 'login-error' : undefined}
          className="mt-2 block h-12 w-full rounded-[6px] border border-input bg-deep px-4 text-white outline-none focus:border-signal"
        />
      </div>
      {state?.error && <p id="login-error" role="alert" className="text-sm text-destructive">{state.error}</p>}
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-signal text-sm font-semibold text-white hover:bg-[#3a98ff] disabled:opacity-70">
        {pending && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
