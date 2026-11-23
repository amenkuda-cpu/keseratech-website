import { Mail, MessageCircle } from 'lucide-react';

/** Opens a ready-written email or WhatsApp message to a client in the admin's own email app or WhatsApp. Nothing is sent from the server. */
export function MessageButtons({ email, phone, name, subject, body }: { email?: string | null; phone?: string | null; name: string; subject: string; body?: string }) {
  const first = name.trim().split(/\s+/)[0] || 'there';
  const text = body ?? `Hi ${first},\n\n`;
  const wa = phone ? phone.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^0(?=7)/, '263') : '';
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {email && (
        <a className="a-btn-ghost" href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}>
          <Mail className="size-3.5" /> Email
        </a>
      )}
      {wa.length >= 9 && (
        <a className="a-btn-ghost" href={`https://wa.me/${wa}?text=${encodeURIComponent(text.trim())}`} target="_blank" rel="noreferrer">
          <MessageCircle className="size-3.5" /> WhatsApp
        </a>
      )}
    </span>
  );
}
