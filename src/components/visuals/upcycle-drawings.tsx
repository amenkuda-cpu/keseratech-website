'use client';

import { cn } from '@/lib/utils';

// Sera Home drawings: one material each, drawn at three stages (0 discarded, 1 transformed, 2 in use).
// Used by the interactive UpcycleFlow and by the project schematic. ViewBox 0 0 600 380.

const COPPER = 'var(--color-home)';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.12em]';

function Layer({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <g style={{ opacity: show ? 1 : 0, transition: 'opacity 700ms cubic-bezier(0.16,1,0.3,1)' }} aria-hidden={!show}>
      {children}
    </g>
  );
}

export function ContainerDrawing({ stage, still }: { stage: number; still: boolean }) {
  const ribs = Array.from({ length: 29 }, (_, i) => 96 + i * 14);
  return (
    <>
      {/* roof solar (in use) */}
      <Layer show={stage === 2}>
        {[130, 220, 310].map((x) => (
          <g key={x}>
            <path d={`M${x} 158 L${x + 18} 132 L${x + 92} 132 L${x + 74} 158 Z`} fill="rgb(26 134 250 / 0.12)" stroke="var(--color-signal-soft)" strokeOpacity="0.8" />
            <path d={`M${x + 37} 158 L${x + 55} 132`} stroke="var(--color-signal-soft)" strokeOpacity="0.4" />
          </g>
        ))}
      </Layer>
      {/* box */}
      <rect x="90" y="160" width="420" height="140" rx="2" fill="#0b1222" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
      {ribs.map((x) => (
        <line key={x} x1={x} y1="164" x2={x} y2="296" stroke="white" strokeOpacity={stage === 2 ? 0.08 : 0.16} />
      ))}
      {/* rust (discarded) */}
      <Layer show={stage === 0}>
        <ellipse cx="170" cy="282" rx="46" ry="12" fill={COPPER} fillOpacity="0.35" />
        <ellipse cx="380" cy="176" rx="34" ry="9" fill={COPPER} fillOpacity="0.3" />
        <ellipse cx="455" cy="270" rx="22" ry="16" fill={COPPER} fillOpacity="0.25" />
        <text x="300" y="236" textAnchor="middle" className={cn(LABEL, 'fill-white/45')}>40 ft · 12.2 m · steel</text>
      </Layer>
      {/* cut lines + insulation (transformed) */}
      <Layer show={stage === 1}>
        <rect x="98" y="168" width="404" height="124" fill="none" stroke={COPPER} strokeOpacity="0.6" strokeDasharray="3 5" />
        {[
          [130, 196, 90, 58],
          [250, 196, 90, 58],
          [400, 186, 56, 106],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke="white" strokeWidth="1.6" strokeDasharray="6 5" className={still ? undefined : 'animate-[flow_1.6s_steps(14)_infinite]'} />
        ))}
        {!still && (
          <g className="animate-[blink-soft_0.6s_ease-in-out_infinite]">
            {[[-10, -8], [12, -12], [-14, 6], [8, 10]].map(([dx, dy], i) => (
              <line key={i} x1="340" y1="196" x2={340 + dx!} y2={196 + dy!} stroke="#ffd59a" strokeWidth="1.5" strokeLinecap="round" />
            ))}
          </g>
        )}
        <text x="300" y="318" textAnchor="middle" className={cn(LABEL, 'fill-white/50')}>Cut · frame · insulate</text>
      </Layer>
      {/* finished (in use) */}
      <Layer show={stage === 2}>
        {[
          [130, 196, 90, 58],
          [250, 196, 90, 58],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="rgb(217 165 110 / 0.28)" stroke="white" strokeWidth="1.6" />
            <line x1={x! + w! / 2} y1={y} x2={x! + w! / 2} y2={y! + h!} stroke="white" strokeOpacity="0.6" />
          </g>
        ))}
        <rect x="400" y="186" width="56" height="106" fill="#16213b" stroke="white" strokeWidth="1.6" />
        <circle cx="446" cy="242" r="2.5" fill="white" />
        {/* deck and steps */}
        <path d="M380 300 H530 V310 H380 Z" fill="#0b1222" stroke="white" strokeOpacity="0.45" />
        {[388, 404, 420, 436, 452, 468, 484, 500, 516].map((x) => (
          <line key={x} x1={x} y1="300" x2={x} y2="310" stroke="white" strokeOpacity="0.25" />
        ))}
        {/* plant */}
        <path d="M110 300 q-4 -26 6 -36 M116 300 q2 -22 14 -28 M112 300 q-12 -14 -18 -16" stroke="#5fcb7e" strokeWidth="1.6" fill="none" />
        <rect x="100" y="296" width="26" height="12" fill="#0b1222" stroke="white" strokeOpacity="0.4" />
        <text x="300" y="350" textAnchor="middle" className={cn(LABEL, 'fill-white/60')}>Home · gym · office</text>
      </Layer>
      <line x1="40" y1="310" x2="560" y2="310" stroke="white" strokeOpacity="0.3" />
    </>
  );
}

function Drum({ x, y = 160, scale = 1, rust = false }: { x: number; y?: number; scale?: number; rust?: boolean }) {
  const w = 110 * scale;
  const h = 150 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y="0" width={w} height={h} rx="6" fill="#0b1222" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
      <ellipse cx="0" cy="0" rx={w / 2} ry={10 * scale} fill="#101a30" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
      {[0.33, 0.66].map((f) => (
        <path key={f} d={`M${-w / 2} ${h * f} q${w / 2} ${8 * scale} ${w} 0`} stroke="white" strokeOpacity="0.35" fill="none" />
      ))}
      {rust && (
        <>
          <ellipse cx={-w * 0.18} cy={h * 0.8} rx={w * 0.22} ry={10 * scale} fill={COPPER} fillOpacity="0.4" />
          <ellipse cx={w * 0.2} cy={h * 0.2} rx={w * 0.14} ry={7 * scale} fill={COPPER} fillOpacity="0.3" />
        </>
      )}
    </g>
  );
}

export function DrumDrawing({ stage, still }: { stage: number; still: boolean }) {
  return (
    <>
      <Layer show={stage < 2}>
        <Drum x={300} rust={stage === 0} />
        <Layer show={stage === 0}>
          <text x="300" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/45')}>200 L · steel</text>
        </Layer>
        <Layer show={stage === 1}>
          {/* seat cut-out and the line that halves a drum for a table */}
          <path d="M248 210 Q300 236 352 210 L352 268 L248 268 Z" fill="none" stroke="white" strokeWidth="1.6" strokeDasharray="6 5" className={still ? undefined : 'animate-[flow_1.6s_steps(14)_infinite]'} />
          <line x1="236" y1="268" x2="364" y2="268" stroke={COPPER} strokeWidth="1.6" strokeDasharray="4 4" />
          <text x="378" y="214" className={cn(LABEL, 'fill-white/55')}>Seat</text>
          <text x="378" y="272" className={cn(LABEL, 'fill-white/55')}>Cut line</text>
          <text x="300" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/50')}>Clean · mark · cut</text>
        </Layer>
      </Layer>
      <Layer show={stage === 2}>
        {/* chair */}
        <g transform="translate(150 170)">
          <path d="M-44 0 Q0 -14 44 0 L44 70 Q0 82 -44 70 Z" fill="#0b1222" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M-40 40 Q0 52 40 40 L40 58 Q0 70 -40 58 Z" fill={COPPER} fillOpacity="0.7" />
          <path d="M-44 70 L-48 140 M44 70 L48 140 M-20 80 L-22 140 M20 80 L22 140" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
          <text x="0" y="172" textAnchor="middle" className={cn(LABEL, 'fill-white/60')}>Chair</text>
        </g>
        {/* table */}
        <g transform="translate(300 214)">
          <ellipse cx="0" cy="0" rx="62" ry="12" fill={COPPER} fillOpacity="0.55" stroke="white" strokeOpacity="0.6" />
          <rect x="-44" y="4" width="88" height="40" rx="4" fill="#0b1222" stroke="white" strokeOpacity="0.55" />
          <path d="M-36 44 L-40 96 M36 44 L40 96" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
          <text x="0" y="128" textAnchor="middle" className={cn(LABEL, 'fill-white/60')}>Table</text>
        </g>
        {/* handwashing station */}
        <g transform="translate(450 150)">
          <rect x="-34" y="0" width="68" height="84" rx="5" fill="#0b1222" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M-12 84 V96 H6" stroke="var(--color-signal-soft)" strokeWidth="2" fill="none" />
          {!still && <circle cx="6" cy="104" r="2.5" fill="var(--color-signal-soft)" className="animate-[blink-soft_1.2s_ease-in-out_infinite]" />}
          <path d="M-30 118 Q0 132 30 118 L26 140 Q0 150 -26 140 Z" fill="#0b1222" stroke="white" strokeOpacity="0.55" />
          <path d="M-34 84 L-38 160 M34 84 L38 160" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
          <text x="0" y="192" textAnchor="middle" className={cn(LABEL, 'fill-white/60')}>Handwash</text>
        </g>
      </Layer>
      <line x1="40" y1="310" x2="560" y2="310" stroke="white" strokeOpacity="0.3" />
    </>
  );
}

export function MaterialsDrawing({ stage }: { stage: number }) {
  const tyre = (x: number, y: number, k: string) => <ellipse key={k} cx={x} cy={y} rx="24" ry="9" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="5" />;
  const bottle = (x: number, y: number, r: number, k: string) => (
    <rect key={k} x={x} y={y} width="10" height="26" rx="3" fill="rgb(127 180 255 / 0.25)" stroke="var(--color-signal-soft)" strokeOpacity="0.7" transform={`rotate(${r} ${x + 5} ${y + 13})`} />
  );
  return (
    <>
      <Layer show={stage === 0}>
        {tyre(170, 296, 'a')}
        {tyre(196, 286, 'b')}
        {tyre(410, 298, 'c')}
        {bottle(260, 270, 70, 'd')}
        {bottle(300, 282, -20, 'e')}
        {bottle(330, 268, 40, 'f')}
        {bottle(360, 286, 95, 'g')}
        <path d="M440 300 L520 276 M446 292 L524 268" stroke={COPPER} strokeOpacity="0.7" strokeWidth="5" />
        <path d="M120 300 L150 260 L176 300" stroke="white" strokeOpacity="0.4" fill="none" strokeWidth="2" />
        <text x="300" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/45')}>Tyres · bottles · timber · scrap</text>
      </Layer>
      <Layer show={stage === 1}>
        {[300, 282, 264, 246].map((y, i) => tyre(150, y, `t${i}`))}
        {[0, 1, 2, 3, 4].map((i) => bottle(270 + i * 14, 274, 0, `b${i}`))}
        {[0, 1, 2, 3].map((i) => bottle(277 + i * 14, 246, 0, `c${i}`))}
        {[300, 288, 276].map((y) => (
          <rect key={y} x="400" y={y - 8} width="110" height="8" fill={COPPER} fillOpacity="0.55" stroke="white" strokeOpacity="0.3" />
        ))}
        <text x="150" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/55')}>Tyres</text>
        <text x="305" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/55')}>Bottles</text>
        <text x="455" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/55')}>Timber</text>
      </Layer>
      <Layer show={stage === 2}>
        {/* wall: tyre courses at the base, a band of bottle ends, render above */}
        <rect x="110" y="120" width="380" height="190" fill="#0b1222" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
        {[0, 1, 2].map((row) =>
          Array.from({ length: 7 }, (_, i) => (
            <ellipse key={`${row}-${i}`} cx={140 + i * 54 + (row % 2) * 27} cy={292 - row * 22} rx="24" ry="9" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="4" />
          )),
        )}
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={134 + i * 30} cy={190} r="8" fill="rgb(127 180 255 / 0.35)" stroke="var(--color-signal-soft)" strokeOpacity="0.8" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={149 + i * 30} cy={164} r="7" fill="rgb(217 165 110 / 0.35)" stroke={COPPER} strokeOpacity="0.8" />
        ))}
        {/* bench from reclaimed timber */}
        <path d="M200 300 H400 V290 H200 Z" fill={COPPER} fillOpacity="0.6" />
        <text x="300" y="342" textAnchor="middle" className={cn(LABEL, 'fill-white/60')}>Walls · furniture · facilities</text>
      </Layer>
      <line x1="40" y1="310" x2="560" y2="310" stroke="white" strokeOpacity="0.3" />
    </>
  );
}

