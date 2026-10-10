'use client';

import { useSyncExternalStore } from 'react';

// The server can't know a visitor's motion preference, so anything that renders differently for
// reduced motion must start as "no preference" and switch after hydration. Motion's own
// useReducedMotion reads the media query on the first client render, which makes server and
// browser HTML disagree. Use this hook instead everywhere.

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
