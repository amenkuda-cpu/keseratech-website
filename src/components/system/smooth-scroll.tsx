'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Registers GSAP's ScrollTrigger. Scrolling itself is the browser's own: an earlier smooth-scroll
 * library made wheel input feel delayed and cost script time on every frame, so it was removed.
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);
  return null;
}
