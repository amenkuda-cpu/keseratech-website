'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import type { Project } from '@/lib/db';
import { cn } from '@/lib/utils';
import { DeliverySchematic, EvSchematic, HomeSchematic, IrrigationSchematic, MarketplaceSchematic, UpcycleSchematic } from './schematics';

/** A schematic inside a drafting frame with registration marks. */
export function SchematicFrame({ children, className, note }: { children: React.ReactNode; className?: string; note?: string }) {
  return (
    <div className={cn('drafting relative overflow-hidden rounded-[6px] border border-hair bg-[#070a14]', className)}>
      {(['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'] as const).map((pos) => (
        <span key={pos} aria-hidden className={cn('absolute size-3 border-white/30', pos)} />
      ))}
      {children}
      {note && <p className="t-label absolute bottom-4 right-6 hidden text-white/30 sm:block">{note}</p>}
    </div>
  );
}

/** Runs a diagram only while it is on screen: its timers and CSS animations pause when scrolled away. */
export function ProjectVisual({ visual, playing = true, className }: { visual: Project['visual'] | 'home'; playing?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { margin: '100px 0px' });
  const run = playing && onScreen;
  const props = { playing: run, className };
  return (
    <div ref={ref} data-paused={run ? undefined : ''}>
      {visual === 'home' && <HomeSchematic {...props} />}
      {visual === 'irrigation' && <IrrigationSchematic {...props} />}
      {visual === 'delivery' && <DeliverySchematic {...props} />}
      {visual === 'ev' && <EvSchematic {...props} />}
      {visual === 'marketplace' && <MarketplaceSchematic {...props} />}
      {visual === 'upcycle' && <UpcycleSchematic {...props} />}
    </div>
  );
}
