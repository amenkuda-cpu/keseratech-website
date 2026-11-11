'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { sprinklerScene } from '@/animations/scroll-scenes';

gsap.registerPlugin(useGSAP);

/**
 * The finale: as the closing section scrolls in, a full-screen sprinkler splash plays over the
 * page and the section is revealed underneath with a wipe as the droplets cover the screen.
 * The overlay never takes clicks (pointer-events: none) and stays hidden until the scene runs,
 * so without JavaScript or with reduced motion the closing section is simply there.
 */
export function SprinklerFinale({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => sprinklerScene(root.current!), { scope: root });

  return (
    <div ref={root} data-sprinkler>
      <div data-sprinkler-overlay aria-hidden className="pointer-events-none invisible fixed inset-0 z-[55] bg-void opacity-0">
        <video
          tabIndex={-1}
          muted
          playsInline
          preload="auto"
          poster="/scenes/sprinkler.webp"
          data-mp4="/scenes/sprinkler.mp4"
          data-webm="/scenes/sprinkler.webm"
          data-mp4-mobile="/scenes/sprinkler-mobile.mp4"
          data-webm-mobile="/scenes/sprinkler-mobile.webm"
          data-poster-mobile="/scenes/sprinkler-mobile.webp"
          className="size-full object-cover"
        />
      </div>
      <div data-sprinkler-content>{children}</div>
    </div>
  );
}
