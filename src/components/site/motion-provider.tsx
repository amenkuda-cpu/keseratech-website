'use client';

import { useEffect } from 'react';
import { MotionConfig, MotionGlobalConfig } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';

// Set before any component mounts, so entrance animations are instant from the first frame.
// It only changes animation timing, never the rendered HTML, so hydration is unaffected.
if (typeof window !== 'undefined') {
  MotionGlobalConfig.instantAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reduced motion, handled once for the whole site: every Motion animation becomes instant, so
 * content arrives in its final place without movement. (Motion's own "user" mode skips transform
 * animations and can leave elements at their starting offset, i.e. invisible behind a mask.)
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    MotionGlobalConfig.instantAnimations = reduce;
  }, [reduce]);
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
