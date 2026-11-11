'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSceneRefresh } from '@/animations/scroll-scenes';

/**
 * Registers GSAP's ScrollTrigger once for the whole site and keeps scroll positions true when
 * the page's height changes after load (fonts, images, orientation). Scrolling itself is the
 * browser's own: an earlier smooth-scroll library made wheel input feel delayed and cost script
 * time on every frame, so it was removed. There is no Lenis/Locomotive to connect.
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    return initSceneRefresh();
  }, []);
  return null;
}
