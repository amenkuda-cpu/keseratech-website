'use client';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/components/system/reduced-motion';
import { cn } from '@/lib/utils';
import { ContainerDrawing, DrumDrawing, MaterialsDrawing } from './upcycle-drawings';

// Concept schematics for the three Kesera projects. They explain how each system works;
// they are labelled as concepts and never presented as product screenshots or results.

type Props = { className?: string; playing?: boolean; title?: boolean };

const LABEL = 'font-mono text-[10px] uppercase tracking-[0.12em]';
const HAIR = { stroke: 'white', strokeOpacity: 0.14, fill: 'none' } as const;

function useCycle(length: number, ms: number, playing: boolean) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing || reduce) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms, playing, reduce]);
  return { i, still: !!reduce };
}

function Caption({ division, name, kind }: { division: string; name: string; kind: string }) {
  return (
    <g>
      <text x="24" y="34" className={cn(LABEL, 'fill-white/70')}>{division} / {name}</text>
      <text x="24" y="50" className={cn(LABEL, 'fill-white/35')}>{kind}</text>
    </g>
  );
}

// ---------------------------------------------------------------------------

const ZONES = [
  { id: 'A', x: 260, y: 92, moisture: 31 },
  { id: 'B', x: 520, y: 92, moisture: 18 },
  { id: 'C', x: 260, y: 332, moisture: 24 },
  { id: 'D', x: 520, y: 332, moisture: 34 },
];
const ZW = 236;
const ZH = 212;
const WATER_ORDER = [1, 2, 0]; // driest first

export function IrrigationSchematic({ className, playing = true, title = true }: Props) {
  const { i, still } = useCycle(WATER_ORDER.length, 3400, playing);
  const active = WATER_ORDER[i]!;
  const agri = 'var(--color-agri)';
  return (
    <svg viewBox="0 0 800 600" className={cn('h-auto w-full', className)} role="img" aria-label="Concept schematic of AgriSera smart irrigation: soil sensors in four field zones report moisture to a controller, which opens the valve of the driest zone.">
      {title && <Caption division="AgriSera" name="Smart irrigation" kind="Concept schematic" />}

      {/* Reservoir, pump, controller */}
      <circle cx="96" cy="316" r="42" {...HAIR} strokeOpacity={0.3} />
      <path d="M62 330 q17 -10 34 0 t34 0" stroke={agri} strokeOpacity="0.6" fill="none" />
      <text x="96" y="384" textAnchor="middle" className={cn(LABEL, 'fill-white/45')}>Reservoir</text>
      <rect x="156" y="298" width="36" height="36" rx="3" {...HAIR} strokeOpacity={0.4} />
      <circle cx="174" cy="316" r="9" {...HAIR} strokeOpacity={0.5} />
      <text x="174" y="356" textAnchor="middle" className={cn(LABEL, 'fill-white/45')}>Pump</text>
      <line x1="138" y1="316" x2="156" y2="316" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

      <rect x="132" y="148" width="84" height="54" rx="3" fill="#0a1020" stroke={agri} strokeOpacity="0.55" />
      <text x="174" y="171" textAnchor="middle" className={cn(LABEL, 'fill-white/80')}>Controller</text>
      <text x="174" y="188" textAnchor="middle" className={cn(LABEL, 'fill-white/40')}>
        {`Zone ${ZONES[active]!.id} · open`}
      </text>

      {/* Mainline and header */}
      <path d="M192 316 H230" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M230 198 V438" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

      {ZONES.map((z, zi) => {
        const on = zi === active;
        const by = z.y + ZH / 2;
        const rows = Array.from({ length: 9 }, (_, r) => z.y + 26 + r * 20);
        const branchX = z.x;
        return (
          <g key={z.id}>
            <rect x={z.x} y={z.y} width={ZW} height={ZH} rx="4" fill={on ? 'rgb(95 203 126 / 0.06)' : 'transparent'} stroke="white" strokeOpacity={on ? 0.32 : 0.14} className="transition-all duration-700" />
            {/* drip lines */}
            {rows.map((ry, r) => (
              <path
                key={r}
                d={`M${z.x + 18} ${ry} C ${z.x + 80} ${ry - 5}, ${z.x + 150} ${ry + 5}, ${z.x + ZW - 14} ${ry}`}
                stroke={on ? agri : 'white'}
                strokeOpacity={on ? 0.55 : 0.1}
                strokeDasharray={on ? '2 7' : undefined}
                fill="none"
                className={on && !still ? 'animate-[drip_1.2s_linear_infinite]' : undefined}
              />
            ))}
            {/* branch to zone (left zones from the header, right zones continue across) */}
            <path
              d={zi % 2 === 0 ? `M230 ${by} H${branchX + 10}` : `M230 ${by} H${z.x - 28} V${by} H${z.x + 10}`}
              stroke={on ? agri : 'white'}
              strokeOpacity={on ? 0.9 : 0.25}
              strokeWidth="2"
              fill="none"
              className="transition-all duration-700"
            />
            {on && !still && <path d={zi % 2 === 0 ? `M230 ${by} H${branchX + 10}` : `M230 ${by} H${z.x + 10}`} stroke="#d6ffe2" strokeWidth="2" strokeDasharray="6 24" fill="none" className="animate-[flow_0.9s_linear_infinite]" />}
            {/* valve */}
            <g transform={`translate(${zi % 2 === 0 ? branchX - 8 : z.x - 8} ${by})`}>
              <path d="M-7 -6 L7 6 L7 -6 L-7 6 Z" fill="#05060b" stroke={on ? agri : 'white'} strokeOpacity={on ? 1 : 0.4} />
            </g>
            {/* sensor + readout */}
            <g transform={`translate(${z.x + ZW - 58} ${z.y + 40})`}>
              <circle r="6" fill="#05060b" stroke={agri} strokeOpacity={on ? 1 : 0.6} />
              <circle r="2" fill={agri} />
              {on && !still && <circle r="6" fill="none" stroke={agri} className="origin-center animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]" />}
            </g>
            <text x={z.x + 14} y={z.y + 18} className={cn(LABEL, 'fill-white/55')}>Zone {z.id}</text>
            <text x={z.x + ZW - 14} y={z.y + 18} textAnchor="end" className={cn(LABEL, on ? 'fill-[#9be8b3]' : 'fill-white/40')}>
              {on ? 'Watering' : `Soil ${z.moisture}%`}
            </text>
            {/* moisture bar */}
            <rect x={z.x + 14} y={z.y + ZH - 16} width={ZW - 28} height="3" rx="1.5" fill="white" fillOpacity="0.08" />
            <rect x={z.x + 14} y={z.y + ZH - 16} width={((ZW - 28) * z.moisture) / 40} height="3" rx="1.5" fill={agri} fillOpacity={on ? 0.9 : 0.45} />
            {/* telemetry link to controller */}
            <path d={`M${z.x + ZW - 58} ${z.y + 40} L216 175`} stroke={agri} strokeOpacity={on ? 0.35 : 0.08} strokeDasharray="2 5" fill="none" className="transition-all duration-700" />
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(24 560)" className={cn(LABEL, 'fill-white/40')}>
        <line x1="0" y1="-4" x2="22" y2="-4" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <text x="30" y="0">Mainline</text>
        <line x1="118" y1="-4" x2="140" y2="-4" stroke={agri} strokeDasharray="2 5" />
        <text x="148" y="0">Drip line</text>
        <circle cx="250" cy="-4" r="5" fill="none" stroke={agri} />
        <text x="262" y="0">Soil sensor</text>
        <path d="M372 -10 L386 2 L386 -10 L372 2 Z" fill="none" stroke="white" strokeOpacity="0.5" />
        <text x="394" y="0">Valve</text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------

const ROUTE = 'M206 214 H330 V300 H470 L560 372 V430';
const BIDS = [
  { x: 128, y: 150, fee: '$2.50', eta: '4 min' },
  { x: 300, y: 128, fee: '$3.00', eta: '2 min' },
  { x: 120, y: 290, fee: '$2.80', eta: '6 min' },
];

export function DeliverySchematic({ className, playing = true, title = true }: Props) {
  const { i, still } = useCycle(4, 2600, playing);
  const chosen = 1;
  const phase = i; // 0..2 bids appear, 3 rider assigned
  const blue = 'var(--color-signal)';
  return (
    <svg viewBox="0 0 800 600" className={cn('h-auto w-full', className)} role="img" aria-label="Concept diagram of how a BikerDash delivery moves: nearby riders offer a fee, the customer picks one, and the rider's route to the drop-off is tracked live.">
      {title && <Caption division="Sera Tech" name="BikerDash" kind="How a delivery moves" />}

      {/* Street grid */}
      <g {...HAIR}>
        {[110, 214, 300, 372, 430, 520].map((y) => <line key={`h${y}`} x1="40" y1={y} x2="770" y2={y} strokeOpacity={y === 300 ? 0.22 : 0.1} strokeWidth={y === 300 ? 3 : 1} />)}
        {[90, 206, 330, 470, 560, 690].map((x) => <line key={`v${x}`} x1={x} y1="70" x2={x} y2="560" strokeOpacity={x === 330 ? 0.22 : 0.1} strokeWidth={x === 330 ? 3 : 1} />)}
        <line x1="40" y1="560" x2="560" y2="90" strokeOpacity="0.08" strokeWidth="2" />
        <line x1="470" y1="300" x2="760" y2="532" strokeOpacity="0.16" strokeWidth="2" />
      </g>
      <text x="338" y="552" className={cn(LABEL, 'fill-white/25')}>Avenue</text>
      <text x="610" y="292" className={cn(LABEL, 'fill-white/25')}>Main road</text>

      {/* Bid radius */}
      <circle cx="206" cy="214" r="150" fill="rgb(26 134 250 / 0.04)" stroke={blue} strokeOpacity="0.25" strokeDasharray="3 6" />
      <text x="206" y="392" textAnchor="middle" className={cn(LABEL, 'fill-white/35')}>Riders nearby</text>

      {/* Route */}
      <path d={ROUTE} stroke="white" strokeOpacity="0.14" strokeWidth="6" fill="none" strokeLinejoin="round" />
      <path d={ROUTE} stroke={blue} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeDasharray={phase === 3 || still ? undefined : '4 8'} className="transition-all duration-700" />

      {/* Pickup */}
      <rect x="192" y="200" width="28" height="28" rx="3" fill="#05060b" stroke={blue} strokeWidth="1.5" />
      <rect x="200" y="208" width="12" height="12" rx="1" fill={blue} />
      <text x="226" y="248" className={cn(LABEL, 'fill-white/70')}>Pickup · shop</text>

      {/* Drop-off */}
      <g transform="translate(560 430)">
        <circle r="26" fill="rgb(26 134 250 / 0.1)" />
        <path d="M0 8 C -10 -4, -12 -10, -12 -14 a12 12 0 0 1 24 0 c0 4 -2 10 -12 22 Z" fill="#05060b" stroke="white" strokeWidth="1.5" />
        <circle cy="-14" r="4" fill="white" />
      </g>
      <text x="590" y="464" className={cn(LABEL, 'fill-white/70')}>Drop-off</text>
      <g transform="translate(600 474)" className={cn(LABEL, 'fill-white/40')}>
        <rect x="-10" y="10" width="16" height="12" rx="1" fill="none" stroke="white" strokeOpacity="0.5" />
        <line x1="-10" y1="15" x2="6" y2="15" stroke="white" strokeOpacity="0.5" />
        <text x="14" y="21">Parcel · small</text>
      </g>

      {/* Riders and their offers */}
      {BIDS.map((b, bi) => {
        const shown = still || phase > bi || phase === 3;
        const isChosen = bi === chosen && (phase === 3 || still);
        return (
          <g key={bi} className="transition-opacity duration-500" style={{ opacity: shown ? 1 : 0.15 }}>
            <circle cx={b.x} cy={b.y} r="7" fill={isChosen ? blue : '#05060b'} stroke={blue} strokeWidth="1.5" />
            <g transform={`translate(${b.x + 14} ${b.y - 30})`}>
              <rect width="104" height="26" rx="3" fill="#0a1020" stroke={isChosen ? blue : 'white'} strokeOpacity={isChosen ? 1 : 0.2} />
              <text x="10" y="17" className={cn(LABEL, 'fill-white')}>{b.fee}</text>
              <text x="94" y="17" textAnchor="end" className={cn(LABEL, 'fill-white/45')}>{b.eta}</text>
            </g>
          </g>
        );
      })}

      {/* Rider on the move */}
      {!still && phase === 3 && (
        <g>
          <circle r="7" fill={blue}>
            <animateMotion dur="2.6s" repeatCount="1" fill="freeze" path={ROUTE} />
          </circle>
          <circle r="14" fill="none" stroke={blue} strokeOpacity="0.4">
            <animateMotion dur="2.6s" repeatCount="1" fill="freeze" path={ROUTE} />
          </circle>
        </g>
      )}

      {/* Readout */}
      <g transform="translate(24 556)">
        <rect width="250" height="30" rx="3" fill="#0a1020" stroke="white" strokeOpacity="0.14" />
        <circle cx="16" cy="15" r="3.5" fill={blue} className={still ? undefined : 'status-live'} />
        <text x="30" y="19" className={cn(LABEL, 'fill-white/75')}>
          {phase === 3 || still ? 'Rider assigned · live tracking' : `Offers received · ${Math.min(phase + 1, 3)} of 3`}
        </text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------

const SITES = [
  { x: 210, y: 150 }, { x: 330, y: 230 }, { x: 120, y: 290 }, { x: 250, y: 330 }, { x: 180, y: 450 }, { x: 345, y: 420 },
];
const FOCUS_SITE = 3;
const BAYS = [
  { x: 470, label: 'Bay 1', charging: true },
  { x: 548, label: 'Bay 2', charging: false },
  { x: 626, label: 'Bay 3', charging: true },
  { x: 704, label: 'Bay 4', charging: false },
];

export function EvSchematic({ className, playing = true, title = true }: Props) {
  const { still } = useCycle(1, 1000, false);
  const lime = 'var(--color-energy)';
  return (
    <svg viewBox="0 0 800 600" className={cn('h-auto w-full', className)} role="img" aria-label="Concept diagram of Sera Energy smart EV charging: connected charging sites across a city, and one site balancing solar, storage and grid power across four charging bays.">
      {title && <Caption division="Sera Energy" name="Smart EV charging" kind="Network concept" />}

      {/* City network */}
      <g {...HAIR}>
        <ellipse cx="240" cy="300" rx="170" ry="190" strokeOpacity="0.16" strokeWidth="2" />
        <ellipse cx="240" cy="300" rx="92" ry="104" strokeOpacity="0.1" />
        {[[240, 80, 240, 520], [40, 300, 420, 300], [90, 140, 390, 460], [90, 460, 390, 140]].map(([x1, y1, x2, y2], k) => (
          <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} strokeOpacity="0.08" />
        ))}
      </g>
      <text x="240" y="300" textAnchor="middle" className={cn(LABEL, 'fill-white/25')}>CBD</text>
      {SITES.map((s, k) => (
        <g key={k}>
          {k === FOCUS_SITE && <circle cx={s.x} cy={s.y} r="18" fill="none" stroke={lime} strokeOpacity="0.4" />}
          <circle cx={s.x} cy={s.y} r="6" fill={k === FOCUS_SITE ? lime : '#05060b'} stroke={lime} strokeWidth="1.5" />
        </g>
      ))}
      <path d={`M${SITES[FOCUS_SITE]!.x + 18} ${SITES[FOCUS_SITE]!.y} H440`} stroke={lime} strokeOpacity="0.4" strokeDasharray="2 5" />
      <text x="40" y="548" className={cn(LABEL, 'fill-white/40')}>Charging sites · status shared live</text>

      {/* Site detail */}
      <rect x="440" y="96" width="336" height="440" rx="4" fill="#0a1020" stroke="white" strokeOpacity="0.14" />
      <text x="460" y="124" className={cn(LABEL, 'fill-white/70')}>Site 04</text>
      <text x="756" y="124" textAnchor="end" className={cn(LABEL, 'fill-white/40')}>2 of 4 bays free</text>

      {/* Energy sources */}
      {[
        { x: 490, label: 'Solar' },
        { x: 608, label: 'Storage' },
        { x: 726, label: 'Grid' },
      ].map((src) => (
        <g key={src.label}>
          <rect x={src.x - 34} y="150" width="68" height="40" rx="3" fill="none" stroke="white" strokeOpacity="0.22" />
          <text x={src.x} y="175" textAnchor="middle" className={cn(LABEL, 'fill-white/70')}>{src.label}</text>
          <path d={`M${src.x} 190 V236 H608`} stroke={lime} strokeOpacity="0.5" fill="none" />
          {!still && <path d={`M${src.x} 190 V236 H608`} stroke={lime} strokeWidth="2" strokeDasharray="5 22" fill="none" className="animate-[flow_1.1s_linear_infinite]" />}
        </g>
      ))}
      <path d="M608 236 V272" stroke={lime} strokeWidth="2" />
      <rect x="560" y="272" width="96" height="30" rx="3" fill="#05060b" stroke={lime} strokeOpacity="0.7" />
      <text x="608" y="292" textAnchor="middle" className={cn(LABEL, 'fill-white/80')}>Load manager</text>
      <path d="M470 330 H704 M608 302 V330" stroke="white" strokeOpacity="0.3" fill="none" />

      {BAYS.map((b) => (
        <g key={b.label}>
          <path d={`M${b.x} 330 V352`} stroke="white" strokeOpacity="0.3" />
          <rect x={b.x - 30} y="352" width="60" height="96" rx="4" fill="none" stroke={b.charging ? lime : 'white'} strokeOpacity={b.charging ? 0.6 : 0.2} />
          <g transform={`translate(${b.x} 392)`}>
            <circle r="20" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="3" />
            {b.charging && (
              <circle
                r="20"
                transform="rotate(-90)"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={still ? 38 : undefined}
                stroke={lime}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className={still || !playing ? undefined : 'animate-[charge_9s_ease-in-out_infinite]'}
                style={{ animationDelay: b.x === 470 ? '0s' : '-4s' }}
              />
            )}
          </g>
          <text x={b.x} y="438" textAnchor="middle" className={cn(LABEL, b.charging ? 'fill-[#e3f7a8]' : 'fill-white/40')}>
            {b.charging ? 'Charging' : 'Free'}
          </text>
          <text x={b.x} y="468" textAnchor="middle" className={cn(LABEL, 'fill-white/40')}>{b.label}</text>
        </g>
      ))}
      <text x="460" y="512" className={cn(LABEL, 'fill-white/40')}>Power shared across bays by availability</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------

const ROOMS = [
  { id: 'living', label: 'Living', x: 150, y: 330, w: 250, h: 150 },
  { id: 'kitchen', label: 'Kitchen', x: 400, y: 330, w: 250, h: 150 },
  { id: 'bed-1', label: 'Bedroom', x: 150, y: 190, w: 250, h: 140 },
  { id: 'study', label: 'Study', x: 400, y: 190, w: 250, h: 140 },
];
const SCENES = [
  { name: 'Morning', lit: ['kitchen'], note: 'Blinds open · geyser on' },
  { name: 'Away', lit: [], note: 'Doors locked · alarm armed' },
  { name: 'Evening', lit: ['living', 'kitchen'], note: 'Lights 40% · gate closed' },
  { name: 'Night', lit: ['bed-1'], note: 'Perimeter lights · alarm armed' },
];

export function HomeSchematic({ className, playing = true, title = true }: Props) {
  const { i, still } = useCycle(SCENES.length, 2800, playing);
  const scene = SCENES[still ? 2 : i]!;
  const copper = 'var(--color-home)';
  return (
    <svg viewBox="0 0 800 600" className={cn('h-auto w-full', className)} role="img" aria-label="Concept section drawing of a Sera Home smart house: lighting, security, solar power and storage connected to one hub that runs scenes such as morning, away, evening and night.">
      {title && <Caption division="Sera Home" name="Smart living" kind="Concept section" />}
      {/* Roof with solar */}
      <path d="M130 190 L400 82 L670 190" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={448 + k * 50} y={118 + k * 20} width="42" height="16" transform={`rotate(21.8 ${448 + k * 50} ${118 + k * 20})`} fill="none" stroke={copper} strokeOpacity="0.8" />
      ))}
      <text x="590" y="104" className={cn(LABEL, 'fill-white/45')}>Solar</text>

      {/* Rooms */}
      {ROOMS.map((r) => {
        const on = scene.lit.includes(r.id);
        return (
          <g key={r.id}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={on ? 'rgb(217 165 110 / 0.12)' : 'transparent'} stroke="white" strokeOpacity="0.2" className="transition-[fill] duration-700" />
            <circle cx={r.x + r.w / 2} cy={r.y + 22} r="7" fill={on ? copper : '#05060b'} stroke={copper} strokeOpacity={on ? 1 : 0.5} className="transition-[fill] duration-700" />
            {on && <path d={`M${r.x + r.w / 2 - 50} ${r.y + r.h} L${r.x + r.w / 2} ${r.y + 30} L${r.x + r.w / 2 + 50} ${r.y + r.h}`} fill="rgb(217 165 110 / 0.06)" />}
            <text x={r.x + 14} y={r.y + r.h - 14} className={cn(LABEL, 'fill-white/45')}>{r.label}</text>
          </g>
        );
      })}
      <line x1="110" y1="480" x2="690" y2="480" stroke="white" strokeOpacity="0.35" strokeWidth="2" />

      {/* Door lock, battery, hub */}
      <rect x="642" y="420" width="16" height="22" rx="2" fill="#05060b" stroke={scene.name === 'Away' || scene.name === 'Night' ? copper : 'white'} strokeOpacity="0.8" />
      <text x="666" y="436" className={cn(LABEL, 'fill-white/45')}>Lock</text>
      <rect x="700" y="300" width="56" height="90" rx="4" fill="none" stroke="white" strokeOpacity="0.3" />
      <rect x="708" y={318 + (scene.name === 'Evening' ? 22 : 0)} width="40" height={scene.name === 'Evening' ? 52 : 74} fill={copper} fillOpacity="0.5" className="transition-all duration-700" />
      <text x="728" y="410" textAnchor="middle" className={cn(LABEL, 'fill-white/45')}>Battery</text>
      <path d="M560 160 C 700 180, 728 240, 728 300" fill="none" stroke={copper} strokeOpacity="0.5" strokeDasharray="3 6" className={still ? undefined : 'animate-[flow_1.4s_linear_infinite]'} />

      <g transform="translate(400 260)">
        <rect x="-44" y="-18" width="88" height="36" rx="18" fill="#0a1020" stroke={copper} />
        <text y="5" textAnchor="middle" className={cn(LABEL, 'fill-white/85')}>Hub</text>
      </g>
      {ROOMS.map((r) => (
        <path key={r.id} d={`M400 278 L${r.x + r.w / 2} ${r.y + 22}`} stroke={copper} strokeOpacity="0.18" strokeDasharray="2 5" fill="none" />
      ))}

      {/* Scene readout */}
      <g transform="translate(24 530)">
        <rect width="300" height="44" rx="3" fill="#0a1020" stroke="white" strokeOpacity="0.14" />
        <text x="16" y="19" className={cn(LABEL, 'fill-white/80')}>Scene · {scene.name}</text>
        <text x="16" y="35" className={cn(LABEL, 'fill-white/45')}>{scene.note}</text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------

const UPCYCLE_TRACKS = ['Shipping container', 'Oil drum', 'Reclaimed materials'] as const;
const UPCYCLE_STAGES = ['Discarded', 'Transformed', 'In use'] as const;

export function UpcycleSchematic({ className, playing = true, title = true }: Props) {
  // 9 states: each material walks through its three stages, then the next material.
  const { i, still } = useCycle(9, 2200, playing);
  const state = still ? 2 : i;
  const track = Math.floor(state / 3);
  const stage = still ? 2 : state % 3;
  const copper = 'var(--color-home)';
  return (
    <svg viewBox="0 0 800 600" className={cn('h-auto w-full', className)} role="img" aria-label="Concept diagram of Sera Home: shipping containers, oil drums and reclaimed materials go from discarded, through transformation, to homes, furniture and facilities in use.">
      {title && <Caption division="Sera Home" name="Sustainable homes" kind="Waste to space" />}

      {/* Material index */}
      <g transform="translate(776 34)">
        {UPCYCLE_TRACKS.map((t, k) => (
          <text key={t} x="0" y={k * 16} textAnchor="end" className={cn(LABEL, k === track ? 'fill-[#ecc79b]' : 'fill-white/30')}>
            {k === track ? '● ' : ''}{t}
          </text>
        ))}
      </g>

      <svg x="40" y="70" width="720" height="456" viewBox="0 0 600 380" overflow="visible">
        {track === 0 && <ContainerDrawing stage={stage} still={still} />}
        {track === 1 && <DrumDrawing stage={stage} still={still} />}
        {track === 2 && <MaterialsDrawing stage={stage} />}
      </svg>

      {/* Stage track */}
      <g transform="translate(24 520)">
        {UPCYCLE_STAGES.map((s, k) => (
          <g key={s} transform={`translate(${k * 250} 0)`}>
            <rect width="232" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
            <rect width="232" height="3" rx="1.5" fill={copper} style={{ transform: `scaleX(${stage >= k ? 1 : 0})`, transformOrigin: 'left', transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)' }} />
            <text x="0" y="24" className={cn(LABEL, stage === k ? 'fill-white/85' : 'fill-white/35')}>
              0{k + 1} {s}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
