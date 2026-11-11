'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { BatteryCharging, PlugZap, Zap } from 'lucide-react';
import { Label } from '@/components/system/primitives';
import { evChargeScene } from '@/animations/scroll-scenes';

gsap.registerPlugin(useGSAP);

// Smart EV charging, told with real footage driven by the scroll: the stage holds still while the
// clip of a driver plugging in plays forward and back with the scrollbar, then the charger's screen
// fills to 100 %. The screen updates through refs (no React re-renders mid-scroll). Timing lives in
// animations/scroll-scenes.ts (evChargeScene, SCENES.ev); the hold length in globals.css (.ev-track).

const SEGMENTS = 12;
const KW = 22; // kW, an AC wall charger
const BATTERY_KWH = 60;
const PRICE_PER_KWH = 0.18; // USD, illustrative

export function EvChargeScene() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pctText = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const statusText = useRef<HTMLSpanElement>(null);
  const timeText = useRef<HTMLSpanElement>(null);
  const energyText = useRef<HTMLSpanElement>(null);
  const costText = useRef<HTMLSpanElement>(null);

  const render = (pct: number) => {
    const p = Math.max(0, Math.min(100, pct));
    if (pctText.current) pctText.current.textContent = String(Math.round(p));
    if (bar.current) bar.current.style.transform = `scaleX(${p / 100})`;
    const remainingMin = (((100 - p) / 100) * BATTERY_KWH) / KW * 60;
    if (timeText.current) timeText.current.textContent = p >= 100 ? 'Full' : `${Math.floor(remainingMin / 60)}h ${String(Math.round(remainingMin % 60)).padStart(2, '0')}m`;
    const added = (p / 100) * BATTERY_KWH;
    if (energyText.current) energyText.current.textContent = `${added.toFixed(1)} kWh`;
    if (costText.current) costText.current.textContent = `$${(added * PRICE_PER_KWH).toFixed(2)}`;
    if (statusText.current) statusText.current.textContent = p >= 100 ? 'Charged' : p > 0 ? 'Charging' : 'Connected';
  };

  useGSAP(() => evChargeScene(root.current!, { track: track.current!, video: video.current!, render }), { scope: root });

  return (
    <section ref={root} id="ev-charging" aria-labelledby="ev-title" className="relative bg-void">
      <div ref={track} className="ev-track">
        <div className="ev-stage">
          <video
            ref={video}
            muted
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            poster="/media/ev-charging-scrub.webp"
            data-mp4="/media/ev-charging-scrub.mp4"
            data-webm="/media/ev-charging-scrub.webm"
            data-mp4-mobile="/media/ev-charging-scrub-portrait.mp4"
            data-webm-mobile="/media/ev-charging-scrub-portrait.webm"
            data-poster-mobile="/media/ev-charging-scrub-portrait.webp"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Light falls off towards the text; the port glows green while it charges */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-void/85 via-void/35 to-transparent max-md:bg-gradient-to-t max-md:from-void/95 max-md:via-void/40" />
          <div
            data-ev="glow"
            aria-hidden
            className="pointer-events-none invisible absolute left-[78%] top-[52%] size-[38vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(74_222_128/0.35),transparent_65%)] max-md:left-[70%] max-md:top-[42%]"
          />

          <div className="shell relative flex h-full flex-col justify-end pb-10 pt-24 md:justify-center md:pb-0">
            <div data-ev="intro" className="max-w-xl max-md:mb-auto max-md:pt-6">
              <Label className="text-white/70">Sera Energy · Smart EV charging</Label>
              <h2 id="ev-title" className="t-display-l mt-8">
                Plug in.
                <br />
                <em>Power up.</em>
              </h2>
              <p className="t-lead mt-6 max-w-md text-white/80">Connected chargers for Zimbabwe that work around load-shedding, solar and the grid. Keep scrolling to charge.</p>
            </div>

            {/* The charger's screen. The outer box positions it (incl. its centring transform); the inner one is what GSAP animates. */}
            <div className="absolute bottom-24 left-[var(--gutter)] right-[var(--gutter)] sm:bottom-8 md:bottom-auto md:right-auto md:top-1/2 md:w-[min(420px,40vw)] md:-translate-y-1/2 motion-reduce:md:left-auto motion-reduce:md:right-[var(--gutter)]">
              <div data-ev="screen" role="img" aria-label="A charger screen counting up to a full battery" className="invisible">
                <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-[#0b0f0c]/85 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.08)] md:p-7">
                  <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgb(74_222_128/0.18),transparent_70%)]" />
                  <div className="relative flex items-center justify-between">
                    <span className="t-label flex items-center gap-2 text-[#86efac]">
                      <PlugZap className="size-3.5" aria-hidden /> <span ref={statusText}>Connected</span>
                    </span>
                    <span className="t-label text-white/45">Bay 02 · {KW} kW AC</span>
                  </div>

                  <div className="relative mt-6 flex items-end justify-between gap-6">
                    <p className="font-display text-[clamp(4rem,9vw,6.5rem)] font-semibold leading-[0.85] tracking-[-0.02em] text-white tabular-nums">
                      <span ref={pctText}>0</span>
                      <span className="text-[0.4em] text-[#86efac]">%</span>
                    </p>
                    <BatteryCharging className="mb-2 size-9 text-[#4ade80] drop-shadow-[0_0_12px_rgb(74_222_128/0.8)]" strokeWidth={1.5} aria-hidden />
                  </div>

                  {/* Progress bar: one fill scaled on X from the left, with a glow, under segment ticks */}
                  <div className="relative mt-6 h-5 overflow-hidden rounded-full bg-white/[0.07] ring-1 ring-white/10" aria-hidden>
                    <span
                      ref={bar}
                      className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#86efac] shadow-[0_0_24px_4px_rgb(74_222_128/0.55)]"
                      style={{ transform: 'scaleX(0)' }}
                    />
                    <span className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${SEGMENTS}, 1fr)` }}>
                      {Array.from({ length: SEGMENTS }, (_, i) => (
                        <span key={i} className="border-r border-black/40 last:border-0" />
                      ))}
                    </span>
                  </div>

                  <dl className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
                    <div><dt className="t-label text-[0.6rem] text-white/45">Added</dt><dd className="mt-1 font-semibold tabular-nums text-white"><span ref={energyText}>0.0 kWh</span></dd></div>
                    <div><dt className="t-label text-[0.6rem] text-white/45">Time to full</dt><dd className="mt-1 font-semibold tabular-nums text-white"><span ref={timeText}>2h 44m</span></dd></div>
                    <div><dt className="t-label text-[0.6rem] text-white/45">Cost</dt><dd className="mt-1 font-semibold tabular-nums text-white"><span ref={costText}>$0.00</span></dd></div>
                  </dl>
                </div>
                <p data-ev="outro" className="invisible mt-4 flex items-center gap-2 text-sm text-white/75 max-md:hidden">
                  <Zap className="size-4 text-[#4ade80]" aria-hidden /> Smart EV charging is in development at Sera Energy.
                </p>
              </div>
            </div>
          </div>
          <p className="t-label absolute bottom-3 right-[var(--gutter)] text-[0.55rem] text-white/35">Footage: Gustavo Fring, Pexels · Charger screen is a concept</p>
        </div>
      </div>
    </section>
  );
}
