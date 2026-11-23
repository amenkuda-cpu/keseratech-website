'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/app/admin/actions';

// iOS-style grouped fields: one rounded panel, a hairline between rows, a full-width pill button.
export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8">
      <div className="overflow-hidden rounded-[18px] bg-white/95 shadow-[0_1px_0_rgb(255_255_255/0.4)_inset]">
        <label className="flex items-center gap-3 px-4">
          <span className="w-[84px] shrink-0 text-[15px] text-[#1c1c1e]">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@keseratech.com"
            aria-invalid={!!state?.error}
            className="ios-field h-[52px] min-w-0 flex-1 bg-transparent text-[16px] text-[#1c1c1e] outline-none placeholder:text-[#c4c4c9]"
          />
        </label>
        <div className="ml-4 h-px bg-[#e5e5ea]" />
        <label className="flex items-center gap-3 px-4">
          <span className="w-[84px] shrink-0 text-[15px] text-[#1c1c1e]">Password</span>
          <input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="Required"
            aria-invalid={!!state?.error}
            aria-describedby={state?.error ? 'login-error' : undefined}
            className="ios-field h-[52px] min-w-0 flex-1 bg-transparent text-[16px] text-[#1c1c1e] outline-none placeholder:text-[#c4c4c9]"
          />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="grid size-8 place-items-center rounded-full text-[#8e8e93] hover:bg-[#f2f2f7]">
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </label>
      </div>
      {state?.error && (
        <p id="login-error" role="alert" className="mt-3 text-center text-[14px] text-[#ff9f9a]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#0a84ff] text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_#0a84ff] transition active:scale-[0.98] hover:bg-[#1a8dff] disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Sign In
      </button>
    </form>
  );
}
