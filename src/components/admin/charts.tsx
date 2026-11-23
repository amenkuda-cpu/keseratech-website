// Server-rendered SVG charts for the admin dashboards. No chart library: every chart is plain SVG
// with <title> tooltips, a legend for 2+ series and a table view, so values never rely on colour.
// Palette: the dataviz reference categorical order (validated light-mode, adjacent pairs).

export const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'] as const;
/** Premium default: one blue ramp, dark to light (ordinal steps from the reference sequential blue). */
export const BLUES = ['#0d366b', '#1c5cab', '#2a78d6', '#5598e7', '#86b6ef'] as const;
const GRID = '#edf1f7';
const AXIS_TEXT = '#6b7a93';

type Fmt = (n: number) => string;
const plain: Fmt = (n) => n.toLocaleString('en-US');

function niceMax(v: number) {
  if (v <= 0) return 4;
  // Smallest clean step (1, 2, 2.5 or 5 x 10^n) whose four gridlines reach v.
  const pow = 10 ** Math.floor(Math.log10(v / 4));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v) ?? 10 * pow;
  return step * 4;
}

/** Path for a bar with 4px rounded top corners and a square base. */
function topRounded(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return '';
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export function Legend({ items }: { items: { name: string; color: string; value?: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[#41506b]">
      {items.map((i) => (
        <li key={i.name} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden />
          {i.name}
          {i.value !== undefined && <span className="font-semibold text-[#14213d]">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}

export function TableView({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-[12.5px] text-[#41506b]">
      <summary className="cursor-pointer select-none text-[#2a78d6] hover:underline">Show table</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[280px] text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-[#e3e9f3]">
              {head.map((h) => (
                <th key={h} className="px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#eef2f8] last:border-0">
                {r.map((c, j) => (
                  <td key={j} className={j ? 'px-2 py-1.5 tabular-nums' : 'px-2 py-1.5'}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Columns per month, stacked by series. One series = one colour; several = legend + stacked segments with 2px gaps. */
export function StackedColumns({
  labels,
  series,
  colors = BLUES as unknown as string[],
  format = plain,
  height = 220,
  caption,
  highlightLast = true,
  gid = 'c',
}: {
  labels: string[];
  series: { name: string; values: number[] }[];
  colors?: string[];
  format?: Fmt;
  height?: number;
  caption: string;
  highlightLast?: boolean;
  /** Unique id for the gradient when several charts share a page. */
  gid?: string;
}) {
  const W = 640;
  const H = height;
  const padL = 44;
  const padB = 26;
  const padT = 22;
  const plotW = W - padL - 8;
  const plotH = H - padB - padT;
  const totals = labels.map((_, i) => series.reduce((s, x) => s + x.values[i], 0));
  const max = niceMax(Math.max(...totals, 0));
  const slot = plotW / labels.length;
  const bw = Math.min(30, slot * 0.55);
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k);
  const maxIdx = totals.indexOf(Math.max(...totals));
  const visible = series.filter((s) => s.values.some((v) => v > 0));
  const shown = visible.length ? visible : series.slice(0, 1);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={caption}>
        <defs>
          <linearGradient id={`col-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor="#0d366b" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((label, i) => {
          const cx = padL + slot * i + slot / 2;
          let acc = 0;
          const segs = series
            .map((s, si) => ({ s, si, v: s.values[i] }))
            .filter((x) => x.v > 0);
          const tip = `${label}: ${format(totals[i])}${segs.length > 1 ? '\n' + segs.map((x) => `${x.s.name}: ${format(x.v)}`).join('\n') : ''}`;
          return (
            <g key={label} className="group">
              <title>{tip}</title>
              <rect x={cx - slot / 2} y={padT} width={slot} height={plotH} fill="transparent" className="group-hover:fill-[#2a78d6]/[0.05]" />
              {segs.map((x, k) => {
                const y0 = y(acc);
                acc += x.v;
                const y1 = y(acc);
                const isTop = k === segs.length - 1;
                const h = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0));
                const top = y1;
                return isTop ? (
                  <path key={x.s.name} d={topRounded(cx - bw / 2, top, bw, h)} fill={series.length === 1 ? `url(#col-${gid})` : colors[x.si % colors.length]} opacity={highlightLast && series.length === 1 && i !== labels.length - 1 ? 0.55 : 1} />
                ) : (
                  <rect key={x.s.name} x={cx - bw / 2} y={top} width={bw} height={h} fill={colors[x.si % colors.length]} />
                );
              })}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill={AXIS_TEXT}>
                {label}
              </text>
              {totals[i] > 0 && (i === maxIdx || i === labels.length - 1) && (
                <text x={cx} y={y(totals[i]) - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#14213d">
                  {format(totals[i])}
                </text>
              )}
            </g>
          );
        })}
        <line x1={padL} x2={W - 8} y1={y(0)} y2={y(0)} stroke="#c9d3e3" strokeWidth={1} />
      </svg>
      {series.length > 1 && (
        <div className="mt-3">
          <Legend items={shown.map((s) => ({ name: s.name, color: colors[series.indexOf(s) % colors.length], value: format(s.values.reduce((a, b) => a + b, 0)) }))} />
        </div>
      )}
      <TableView
        caption={caption}
        head={['Month', ...(series.length > 1 ? series.map((s) => s.name) : []), 'Total']}
        rows={labels.map((l, i) => [l, ...(series.length > 1 ? series.map((s) => format(s.values[i])) : []), format(totals[i])])}
      />
    </figure>
  );
}

/** Donut for parts of a whole, with 2px surface gaps between slices and the total in the middle. */
export function Donut({ items, colors = BLUES as unknown as string[], centerLabel, format = plain, caption }: { items: { name: string; value: number }[]; colors?: string[]; centerLabel: string; format?: Fmt; caption: string }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const R = 64;
  const r = 44;
  const C = 80;
  let a0 = -Math.PI / 2;
  const arc = (from: number, to: number) => {
    const large = to - from > Math.PI ? 1 : 0;
    const p = (rad: number, ang: number) => `${C + rad * Math.cos(ang)},${C + rad * Math.sin(ang)}`;
    return `M${p(R, from)}A${R},${R} 0 ${large} 1 ${p(R, to)}L${p(r, to)}A${r},${r} 0 ${large} 0 ${p(r, from)}Z`;
  };
  return (
    <figure className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 160 160" className="size-36 shrink-0" role="img" aria-label={caption}>
        {total === 0 ? (
          <circle cx={C} cy={C} r={(R + r) / 2} fill="none" stroke="#e8eef7" strokeWidth={R - r} />
        ) : (
          items.map((it, i) => {
            if (!it.value) return null;
            const span = (it.value / total) * Math.PI * 2;
            const gap = items.filter((x) => x.value).length > 1 ? 0.035 : 0;
            const d = span >= Math.PI * 2 - 0.001 ? null : arc(a0 + gap / 2, a0 + span - gap / 2);
            a0 += span;
            return d ? (
              <path key={it.name} d={d} fill={colors[i % colors.length]}>
                <title>{`${it.name}: ${format(it.value)} (${Math.round((it.value / total) * 100)}%)`}</title>
              </path>
            ) : (
              <circle key={it.name} cx={C} cy={C} r={(R + r) / 2} fill="none" stroke={colors[i % colors.length]} strokeWidth={R - r}>
                <title>{`${it.name}: ${format(it.value)} (100%)`}</title>
              </circle>
            );
          })
        )}
        <text x={C} y={C - 2} textAnchor="middle" fontSize={22} fontWeight={700} fill="#14213d">
          {format(total)}
        </text>
        <text x={C} y={C + 16} textAnchor="middle" fontSize={10.5} fill={AXIS_TEXT}>
          {centerLabel}
        </text>
      </svg>
      <ul className="min-w-[200px] flex-1 space-y-1.5 text-[13px] text-[#41506b]">
        {items.map((it, i) => (
          <li key={it.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colors[i % colors.length] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate">{it.name}</span>
            <span className="font-semibold tabular-nums text-[#14213d]">{format(it.value)}</span>
            <span className="w-10 text-right tabular-nums text-[#8a97ad]">{total ? `${Math.round((it.value / total) * 100)}%` : '–'}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Progress ring for the revenue target: a lively blue-to-green sweep on a light blue track. */
export function TargetRing({ pct, value, sub, size = 168, id = 'ring' }: { pct: number; value: string; sub: string; size?: number; id?: string }) {
  const R = 66;
  const circ = 2 * Math.PI * R;
  const p = Math.max(0, Math.min(100, pct));
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={`${value}, ${sub}`} className="shrink-0">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d366b" />
          <stop offset="60%" stopColor="#1c5cab" />
          <stop offset="100%" stopColor="#3fa3ff" />
        </linearGradient>
      </defs>
      <circle cx={80} cy={80} r={R} fill="none" stroke="#e9eff8" strokeWidth={12} />
      {p > 0 && (
        <circle
          cx={80}
          cy={80}
          r={R}
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${(p / 100) * circ} ${circ}`}
          transform="rotate(-90 80 80)"
          className="ring-sweep"
        />
      )}
      <text x={80} y={78} textAnchor="middle" fontSize={26} fontWeight={800} fill="#14213d">
        {value}
      </text>
      <text x={80} y={98} textAnchor="middle" fontSize={11} fill={AXIS_TEXT}>
        {sub}
      </text>
    </svg>
  );
}

/** Horizontal bars, one colour each from the palette in fixed order, value at the tip. */
export function HBars({ items, colors = BLUES as unknown as string[], format = plain, caption }: { items: { name: string; value: number }[]; colors?: string[]; format?: Fmt; caption: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <figure>
      <ul className="space-y-3" aria-label={caption}>
        {items.map((it, i) => (
          <li key={it.name} title={`${it.name}: ${format(it.value)}`}>
            <div className="mb-1 flex justify-between gap-3 text-[13px]">
              <span className="truncate text-[#41506b]">{it.name}</span>
              <span className="font-semibold tabular-nums text-[#14213d]">{format(it.value)}</span>
            </div>
            <div className="h-3 rounded-r-[4px] bg-[#eef3fa]">
              <div className="bar-grow h-3 rounded-r-[4px]" style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: colors[i % colors.length] }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** One whole split into parts (pipeline stages), 2px gaps, legend with counts. */
export function SegmentBar({ items, colors = BLUES as unknown as string[], caption }: { items: { name: string; value: number }[]; colors?: string[]; caption: string }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <figure aria-label={caption}>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-[4px] bg-[#eef3fa]">
        {total > 0 &&
          items.map((it, i) =>
            it.value ? <div key={it.name} title={`${it.name}: ${it.value}`} style={{ flexGrow: it.value, background: colors[i % colors.length] }} /> : null,
          )}
      </div>
      <div className="mt-3">
        <Legend items={items.map((it, i) => ({ name: it.name, color: colors[i % colors.length], value: String(it.value) }))} />
      </div>
    </figure>
  );
}

/** Running revenue total against a straight "on pace" line to the target. */
export function PaceChart({ points, targetCents, format, caption }: { points: { label: string; cents: number | null }[]; targetCents: number; format: Fmt; caption: string }) {
  const W = 640;
  const H = 220;
  const padL = 52;
  const padB = 26;
  const padT = 16;
  const plotW = W - padL - 14;
  const plotH = H - padB - padT;
  const max = niceMax(Math.max(targetCents, ...points.map((p) => p.cents ?? 0)));
  const x = (i: number) => padL + (points.length === 1 ? plotW / 2 : (plotW * i) / (points.length - 1));
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const known = points.map((p, i) => ({ ...p, i })).filter((p) => p.cents !== null) as { label: string; cents: number; i: number }[];
  const line = known.map((p, k) => `${k ? 'L' : 'M'}${x(p.i)},${y(p.cents)}`).join('');
  const area = known.length ? `${line}L${x(known[known.length - 1].i)},${y(0)}L${x(known[0].i)},${y(0)}Z` : '';
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k);
  const last = known[known.length - 1];
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={caption}>
        <defs>
          <linearGradient id="pace-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#2a78d6" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - 14} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {format(t)}
            </text>
          </g>
        ))}
        <line x1={x(0)} y1={y(0)} x2={x(points.length - 1)} y2={y(targetCents)} stroke="#b9c4d6" strokeWidth={1.5} />
        <line x1={padL} x2={W - 14} y1={y(targetCents)} y2={y(targetCents)} stroke="#0d366b" strokeWidth={1} />
        <text x={padL + 6} y={y(targetCents) - 6} textAnchor="start" fontSize={11} fontWeight={600} fill="#14213d">
          Target {format(targetCents)}
        </text>
        {area && <path d={area} fill="url(#pace-area)" />}
        {line && <path d={line} fill="none" stroke="#1c5cab" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {known.map((p) => (
          <circle key={p.label} cx={x(p.i)} cy={y(p.cents)} r={4.5} fill="#1c5cab" stroke="#fff" strokeWidth={2}>
            <title>{`${p.label}: ${format(p.cents)} so far`}</title>
          </circle>
        ))}
        {last && (
          <text x={x(last.i)} y={y(last.cents) - 10} textAnchor={last.i > points.length - 3 ? 'end' : 'middle'} fontSize={11} fontWeight={600} fill="#14213d">
            {format(last.cents)}
          </text>
        )}
        {points.map((p, i) => (
          <text key={p.label} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill={AXIS_TEXT}>
            {p.label}
          </text>
        ))}
      </svg>
      <div className="mt-2">
        <Legend
          items={[
            { name: 'Money in (running total)', color: '#1c5cab' },
            { name: 'Target', color: '#0d366b' },
            { name: 'On-pace line', color: '#b9c4d6' },
          ]}
        />
      </div>
      <TableView caption={caption} head={['Month', 'Running total']} rows={points.map((p) => [p.label, p.cents === null ? '–' : format(p.cents)])} />
    </figure>
  );
}

/** Tiny trend line for stat tiles; the current period is the accent dot. */
export function Sparkline({ values, color = '#1c5cab' }: { values: number[]; color?: string }) {
  const W = 96;
  const H = 30;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(W - 6) * (i / Math.max(1, values.length - 1)) + 3, H - 4 - (v / max) * (H - 8)]);
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join('');
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="shrink-0">
      <path d={d} fill="none" stroke="#d3dceb" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={4} fill={color} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}
