import { Lock, Send, Wallet } from 'lucide-react';
import { COMPANY } from '@/content/site';

/** The "you stay in charge" promise, stated exactly as the workforce app enforces it. */
export function YourOkFirst() {
  const items = [
    { icon: Send, t: 'Sending', v: 'Your OK first', b: 'Emails and invitations wait for your approval, unless you pre-approve specific contacts.' },
    { icon: Wallet, t: 'Paying', v: 'Never', b: 'It cannot make payments, transfers or refunds, or sign anything.' },
    { icon: Lock, t: 'Passwords', v: 'Never asked', b: 'Tools connect through official Google and Microsoft sign-in.' },
  ];
  return (
    <ul className="grid gap-px overflow-hidden rounded-md border border-hair bg-hair sm:grid-cols-3">
      {items.map(({ icon: Icon, t, v, b }) => (
        <li key={t} className="bg-void p-5">
          <div className="flex items-center gap-2.5">
            <Icon size={16} className="text-signal" aria-hidden />
            <span className="text-[13px] text-dim">{t}</span>
            <span className="ml-auto rounded-full bg-signal/15 px-2.5 py-0.5 text-[12px] font-semibold text-signal-soft">{v}</span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">{b}</p>
        </li>
      ))}
    </ul>
  );
}

const WA_TEXT = encodeURIComponent("Hi Kesera, I'm interested in an AI employee for my business.");
export const WORKFORCE_WHATSAPP = `${COMPANY.whatsappHref}?text=${WA_TEXT}`;

/** Green WhatsApp chat icon (simple glyph, no brand artwork). */
export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
