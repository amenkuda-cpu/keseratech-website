'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { pullScene } from '@/animations/scroll-scenes';
import { SceneCanvas } from '@/components/scenes/scene-canvas';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

/**
 * A scroll transition where a robotic arm or a crane "lifts" the next section into view.
 * The stage (the scene, full screen) stays put while you scroll through phase 1; then `children`
 * rises over it, in sync with the grip-and-pull part of the scene. Layout and timing live in
 * globals.css (.pull-*) and animations/scroll-scenes.ts.
 */
export function PullTransition({ clip, children, nextClassName, label }: { clip: 'robotic-arm' | 'crane'; children: ReactNode; nextClassName?: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => pullScene(root.current!, clip), { scope: root });

  return (
    <div ref={root} data-pull>
      <div data-pull-track className="pull-track">
        <div data-pull-stage className="pull-stage bg-void">
          <div data-pull-layer className="absolute inset-0">
            <SceneCanvas scene={clip} />
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
