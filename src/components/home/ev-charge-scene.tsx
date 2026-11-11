'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { BatteryCharging, PlugZap, Zap } from 'lucide-react';
import { Label } from '@/components/system/primitives';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Smart EV charging, told with real footage driven by the scroll: the section pins, the clip of a
// driver plugging in plays forward and back with the scrollbar, then the charger's screen fills
// to 100 %. Everything updates through refs inside one GSAP timeline, so React never re-renders
// mid-scroll. With reduced motion the section is a still frame and a full battery, unpinned.

const BARS = 12;
const KW = 22; // kW, an AC wall charger
const BATTERY_KWH = 60;
const PRICE_PER_KWH = 0.18; // USD, illustrative

const LAND = { video: '/media/ev-charging-scrub.mp4', poster: '/media/ev-charging-scrub.webp' };
const PORT = { video: '/media/ev-charging-scrub-portrait.mp4', poster: '/media/ev-charging-scrub-portrait.webp' };

export function EvChargeScene() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pctText = useRef<HTMLSpanElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const statusText = useRef<HTMLSpanElement>(null);
  const timeText = useRef<HTMLSpanElement>(null);
  const energyText = useRef<HTMLSpanElement>(null);
  const costText = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState(LAND);

  // Portrait phones get the portrait crop, so the plug stays in frame.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px) and (orientation: portrait)');
    const pick = () => setSrc(mq.matches ? PORT : LAND);
    pick();
    mq.addEventListener('change', pick);
    return () => mq.removeEventListener('change', pick);
  }, []);

  // iOS only lets a video seek once it has played: play and pause it silently when it can.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const unlock = () => v.play().then(() => v.pause()).catch(() => {});
    v.addEventListener('loadeddata', unlock, { once: true });
    return () => v.removeEventListener('loadeddata', unlock);
  }, [src]);

  const render = (pct: number) => {
    const p = Math.max(0, Math.min(100, pct));
    if (pctText.current) pctText.current.textContent = String(Math.round(p));
    bars.current.forEach((b, i) => {
      if (!b) return;
      const fill = Math.max(0, Math.min(1, p / (100 / BARS) - i));
      b.style.transform = `scaleY(${0.25 + fill * 0.75})`;
      b.style.opacity = String(0.18 + fill * 0.82);
      b.style.boxShadow = fill > 0.5 ? '0 0 18px rgb(74 222 128 / 0.65)' : 'none';
    });
    const remainingMin = ((100 - p) / 100) * BATTERY_KWH / KW * 60;
    if (timeText.current) timeText.current.textContent = p >= 100 ? 'Full' : `${Math.floor(remainingMin / 60)}h ${String(Math.round(remainingMin % 60)).padStart(2, '0')}m`;
    const added = (p / 100) * BATTERY_KWH;
    if (energyText.current) energyText.current.textContent = `${added.toFixed(1)} kWh`;
    if (costText.current) costText.current.textContent = `$${(added * PRICE_PER_KWH).toFixed(2)}`;
    if (statusText.current) statusText.current.textContent = p >= 100 ? 'Charged' : p > 0 ? 'Charging' : 'Connected';
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: reduce)', () => {
        // A still: the full battery beside the heading, nothing pinned or scrubbed.
        render(100);
        gsap.set('[data-ev="screen"], [data-ev="outro"], [data-ev="glow"]', { autoAlpha: 1 });
        gsap.set('[data-ev="screen-pos"]', { className: 'absolute bottom-24 left-[var(--gutter)] right-[var(--gutter)] sm:bottom-8 md:bottom-auto md:left-auto md:top-1/2 md:w-[min(420px,40vw)] md:-translate-y-1/2' });
      });
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        ScrollTrigger.config({ ignoreMobileResize: true });
        const state = { clip: 0, pct: 0 };
        render(0);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.6}`,
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. The driver opens the port and plugs in (clip scrubbed with the scroll)
        tl.to(state, {
          clip: 1,
          duration: 0.5,
          onUpdate: () => {
            const v = video.current; // looked up each time: the element can switch clips
            if (v && v.readyState >= 1 && v.duration) v.currentTime = state.clip * (v.duration - 0.05);
          },
        });
        tl.to('[data-ev="intro"]', { autoAlpha: 0, y: -30, duration: 0.12 }, 0.4);

        // 2. The charger's screen arrives
        tl.fromTo('[data-ev="screen"]', { autoAlpha: 0, y: 60, scale: 0.94, rotateX: 12 }, { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: 0.14, ease: 'power2.out' }, 0.42);
        tl.fromTo('[data-ev="glow"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.45);

        // 3. Charging: bars fill and the percentage counts up
        tl.to(state, { pct: 100, duration: 0.42, onUpdate: () => render(state.pct) }, 0.56);
        tl.to('[data-ev="glow"]', { scale: 1.35, duration: 0.42 }, 0.56);
        tl.fromTo('[data-ev="outro"]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.9);
      });
      // Content above can change height after load (images, fonts); keep start/end positions true.
      let t = 0;
      let lastH = document.body.scrollHeight;
      const ro = new ResizeObserver(() => {
        const h = document.body.scrollHeight;
        if (Math.abs(h - lastH) < 40) return;
        lastH = h;
        clearTimeout(t);
        t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      ro.observe(document.body);
      return () => {
        ro.disconnect();
        clearTimeout(t);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="ev-charging" aria-labelledby="ev-title" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-void [perspective:1200px]">
      <video
        ref={video}
        src={src.video}
        poster={src.poster}
        muted
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 size-full object-cover"
      />
      {/* Light falls off towards the text; the port glows green while it charges */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-void/85 via-void/35 to-transparent max-md:bg-gradient-to-t max-md:from-void/95 max-md:via-void/40" />
      <div
        data-ev="glow"
        aria-hidden
        className="pointer-events-none absolute left-[78%] top-[52%] size-[38vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(74_222_128/0.35),transparent_65%)] opacity-0 mix-blend-screen max-md:left-[70%] max-md:top-[42%]"
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

        {/* The charger's screen */}
        {/* Outer box positions (incl. centring transform); the inner one is what GSAP animates */}
        <div data-ev="screen-pos" className="absolute bottom-24 left-[var(--gutter)] right-[var(--gutter)] sm:bottom-8 md:bottom-auto md:right-auto md:top-1/2 md:w-[min(420px,40vw)] md:-translate-y-1/2">
        <div data-ev="screen" role="img" aria-label="A charger screen counting up to a full battery" className="invisible">
          <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-black/55 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-2xl md:p-7">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[#4ade80]/15 blur-3xl" />
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

            <div className="relative mt-6 flex h-16 items-end gap-1.5" aria-hidden>
              {Array.from({ length: BARS }, (_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    bars.current[i] = el;
                  }}
                  className="h-full flex-1 origin-bottom rounded-[3px] bg-gradient-to-t from-[#16a34a] to-[#86efac] transition-[box-shadow] duration-300"
                  style={{ transform: 'scaleY(0.25)', opacity: 0.18 }}
                />
              ))}
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
    </section>
  );
}
