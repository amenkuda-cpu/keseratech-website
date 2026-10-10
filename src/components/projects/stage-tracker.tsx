import { PIPELINE, STATUS_STAGE, type ProjectStatus } from '@/content/site';
import { cn } from '@/lib/utils';

/** The eight pipeline stages with the project's current one marked. */
export function StageTracker({ status, accent }: { status: ProjectStatus; accent: string }) {
  const current = PIPELINE.findIndex((s) => s.id === STATUS_STAGE[status]);
  return (
    <ol className="grid grid-cols-4 gap-y-6 md:grid-cols-8" aria-label="Development stage">
      {PIPELINE.map((s, i) => {
        const past = i < current;
        const now = i === current;
        return (
          <li key={s.id} aria-current={now ? 'step' : undefined} className="relative pr-2">
            <span aria-hidden className={cn('block h-[3px] rounded-full', past || now ? '' : 'bg-white/10')} style={past || now ? { background: accent, opacity: now ? 1 : 0.45 } : undefined} />
            <p className={cn('t-label mt-3', now ? 'text-white' : past ? 'text-white/55' : 'text-white/30')}>
              {s.label}
              {now && <span className="sr-only"> (current stage)</span>}
            </p>
            {now && <p className="t-label mt-1 text-[0.6rem]" style={{ color: accent }}>Now</p>}
          </li>
        );
      })}
    </ol>
  );
}
