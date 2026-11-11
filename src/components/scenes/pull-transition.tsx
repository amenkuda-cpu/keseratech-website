'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { pullScene } from '@/animations/scroll-scenes';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

/**
 * A scroll transition where a robotic arm or a crane "lifts" the next section into view.
 * The stage (the clip, full screen) stays put while you scroll through phase 1; then `children`
 * rises over it, scrubbed in sync with the grip-and-pull part of the clip. Layout and timing live
 * in globals.css (.pull-*) and animations/scroll-scenes.ts.
 */
export function PullTransition({ clip, children, nextClassName, label }: { clip: 'robotic-arm' | 'crane'; children: ReactNode; nextClassName?: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => pullScene(root.current!, clip), { scope: root });

  return (
    <div ref={root} data-pull>
      <div data-pull-track className="pull-track">
        <div data-pull-stage className="pull-stage bg-void">
          <div data-pull-video-layer className="absolute inset-0">
            <video
              aria-hidden
              tabIndex={-1}
              muted
              playsInline
              preload="auto"
              poster={`/scenes/${clip}.webp`}
              data-mp4={`/scenes/${clip}.mp4`}
              data-webm={`/scenes/${clip}.webm`}
              data-mp4-mobile={`/scenes/${clip}-mobile.mp4`}
              data-webm-mobile={`/scenes/${clip}-mobile.webm`}
              data-poster-mobile={`/scenes/${clip}-mobile.webp`}
              className="size-full object-cover"
            />
          </div>
          <span className="sr-only">{label}</span>
        </div>
      </div>
      <div data-pull-next className={cn('pull-next', nextClassName)}>
        {children}
      </div>
    </div>
  );
}
