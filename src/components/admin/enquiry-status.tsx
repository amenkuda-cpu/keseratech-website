'use client';

import { useState, useTransition } from 'react';
import { setEnquiryStatusAction } from '@/app/admin/actions';
import type { EnquiryStatus } from '@/lib/db';

const STATUSES: EnquiryStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'CLOSED'];

export function EnquiryStatusSelect({ id, status }: { id: number; status: EnquiryStatus }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Status"
      value={value}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as EnquiryStatus;
        setValue(next);
        start(async () => {
          const res = await setEnquiryStatusAction(id, next);
          if (!res.ok) setValue(status);
        });
      }}
      className="h-9 rounded-sm border border-input bg-deep px-2 text-sm text-white"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
      ))}
    </select>
  );
}
