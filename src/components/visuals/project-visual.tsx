'use client';

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

export function ProjectVisual({ visual, playing = true, className }: { visual: Project['visual'] | 'home'; playing?: boolean; className?: string }) {
  if (visual === 'home') return <HomeSchematic playing={playing} className={className} />;
  if (visual === 'irrigation') return <IrrigationSchematic playing={playing} className={className} />;
  if (visual === 'delivery') return <DeliverySchematic playing={playing} className={className} />;
  if (visual === 'ev') return <EvSchematic playing={playing} className={className} />;
  if (visual === 'marketplace') return <MarketplaceSchematic playing={playing} className={className} />;
  if (visual === 'upcycle') return <UpcycleSchematic playing={playing} className={className} />;
  return null;
}
