// Scroll-driven scenes for the home page, one function per scene:
//
//   pullScene()     robotic arm and crane: the scene plays as you scroll, then the next section
//                   rises over it as if the arm / hook were lifting it into view
//   evChargeScene() EV charging: the scene plays while a charger screen fills to 100 %
//
// Each scene is a sequence of still frames (public/scenes/<id>/d|m/0001.webp ...) drawn onto a
// canvas. Scrubbing a <video> instead means a decoder seek on every scroll step, which felt laggy
// and draggy on ordinary laptops; drawing an already-loaded still is near-instant, so the scene
// follows the scroll exactly. scripts/encode-scenes.mjs makes the frames.
//
// Layout is plain CSS (sticky stages inside tall "tracks", see globals.css), so nothing is
// script-pinned, nothing shifts and the page works without JavaScript (a still frame shows).
//
// Every scene:
// - builds nothing for people who prefer reduced motion (they see a still and the content);
// - loads its frames when the section is within two screens, coarse frames first, so the scene
//   is usable almost at once and sharpens as the rest arrive;
// - uses the 9:16 phone frames under 768 px;
// - returns a cleanup function (the React wrappers call it through useGSAP).
//
// Fine-tuning: every adjustable value is in SCENES below. Add ?markers to the URL to see the
// ScrollTrigger start/end markers.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE_OUT = 'power2.out';

/** All tunable values in one place. Distances are in viewport heights (1 = 100svh). */
export const SCENES = {
  pull: {
    /**
     * Scroll length of phase 1 (the scene builds up to the grip, nothing covers it), desktop /
     * phone. Phase 2 (the lift) is always 1 screen. Must match --pull-p1 in globals.css.
     */
    phase1: { desktop: 1.5, mobile: 1 },
    /** The scene reaches the grip this far into phase 1, then holds on it until the lift starts. */
    gripLead: 0.85,
    /** Scroll smoothing in seconds. Frames draw instantly, so this only softens wheel steps. */
    scrub: 0.15,
    /** How far the scene drifts up (yPercent) while the next section lifts in, and where it fades to. */
    layerRise: -22,
    layerFadeTo: 0.25,
  },
  /** Fraction of each scene where the grip has happened: phase 1 plays up to here, phase 2 the rest. */
  gripAt: { 'robotic-arm': 0.8, crane: 0.72 },
  ev: {
    // How long the EV stage is held (2.2 screens desktop, 1.6 phone) is the .ev-track height in globals.css.
    scrub: 0.15,
    /** Timeline split (0-1): scene plays until `plugEnd`, screen appears at `screenIn`, charging runs `chargeStart`-1. */
    plugEnd: 0.5,
    screenIn: 0.42,
    chargeStart: 0.56,
  },
};

const MOBILE = '(max-width: 767px)';
const MOTION = '(prefers-reduced-motion: no-preference)';
const markers = () => typeof location !== 'undefined' && new URLSearchParams(location.search).has('markers');

type Cleanup = () => void;

// ---------------------------------------------------------------------------
// Frame sequences

/**
 * Draws one of `count` frames onto a canvas, without ever decoding an image on the main thread.
 *
 * - Download: each frame is fetched once and kept compressed (a few hundred KB per scene).
 *   Frames arrive in passes (every 8th, then every 4th, 2nd, then all), so a rough version of
 *   the whole scene is ready after an eighth of the download.
 * - Decode: frames near the current position are turned into ImageBitmaps with
 *   createImageBitmap(), which decodes off the main thread. Drawing a ready bitmap is a plain
 *   copy. (Drawing an <img> instead made Chrome decode the WebP on the main thread on every
 *   new frame, which is what made scrolling stutter.) Only a window of frames around the current
 *   one stays decoded, ahead in the scroll direction, so memory stays small.
 * - Draw: the canvas has the frames' own pixel size and CSS crops it to the screen
 *   (object-fit: cover), so each draw is 1:1 and the graphics chip does the scaling. If the exact
 *   frame isn't decoded yet, the nearest decoded one is shown and replaced a moment later.
 */
class FrameSequence {
  /** Compressed frames as they arrive. */
  private blobs: (Blob | null)[];
  /** Decoded frames inside the window. */
  private bitmaps = new Map<number, ImageBitmap>();
  private decoding = new Set<number>();
  private want = 0;
  private direction = 1;
  private drawn = -1;
  private loading = false;
  private dead = false;
  private ctx: CanvasRenderingContext2D | null;
  private static AHEAD = 18;
  private static BEHIND = 6;
  private static KEEP = 28; // frames further than this from the current one are freed
  private static DECODERS = 3;

  constructor(
    private canvas: HTMLCanvasElement,
    private url: (i: number) => string,
    private count: number,
    /** Horizontal focus 0-1 for the crop (0.5 = centre). */
    focusX = 0.5,
  ) {
    this.blobs = new Array(count).fill(null);
    this.ctx = canvas.getContext('2d', { alpha: false });
    canvas.style.objectFit = 'cover';
    canvas.style.objectPosition = `${focusX * 100}% 50%`;
  }

  /** Starts downloading (once). Up to 6 requests at a time. */
  load() {
    if (this.loading) return;
    this.loading = true;
    const order: number[] = [];
    const seen = new Set<number>();
    for (const stride of [8, 4, 2, 1]) {
      for (let i = 0; i < this.count; i += stride) if (!seen.has(i)) (seen.add(i), order.push(i));
    }
    if (!seen.has(this.count - 1)) order.splice(1, 0, this.count - 1);
    let next = 0;
    const pump = () => {
      if (this.dead || next >= order.length) return;
      const i = order[next++]!;
      fetch(this.url(i))
        .then((r) => (r.ok ? r.blob() : null))
        .then((blob) => {
          if (this.dead || !blob) return;
          this.blobs[i] = blob;
          this.fillWindow();
        })
        .catch(() => {})
        .finally(pump);
    };
    for (let k = 0; k < 6; k++) pump();
  }

  /** Shows the frame for a 0-1 position. */
  draw(p: number) {
    const want = Math.round(gsap.utils.clamp(0, 1, p) * (this.count - 1));
    if (want !== this.want) this.direction = want > this.want ? 1 : -1;
    this.want = want;
    this.paint();
    this.fillWindow();
  }

  /** Decodes the frames around the current one (more ahead than behind) and frees the rest. */
  private fillWindow() {
    if (this.dead) return;
    const { AHEAD, BEHIND, KEEP, DECODERS } = FrameSequence;
    for (const [i, bmp] of this.bitmaps) {
      if (Math.abs(i - this.want) > KEEP && i !== this.drawn) {
        bmp.close();
        this.bitmaps.delete(i);
      }
    }
    // Closest first: the current frame, then alternating ahead/behind, weighted to the scroll direction.
    const queue: number[] = [this.want];
    for (let d = 1; d <= AHEAD; d++) {
      queue.push(this.want + d * this.direction);
      if (d <= BEHIND) queue.push(this.want - d * this.direction);
    }
    for (const i of queue) {
      if (this.decoding.size >= DECODERS) break;
      if (i < 0 || i >= this.count || this.bitmaps.has(i) || this.decoding.has(i)) continue;
      const blob = this.blobs[i];
      if (!blob) continue;
      this.decoding.add(i);
      createImageBitmap(blob)
        .then((bmp) => {
          if (this.dead || Math.abs(i - this.want) > KEEP) return bmp.close();
          this.bitmaps.set(i, bmp);
          if (this.drawn < 0 || Math.abs(i - this.want) < Math.abs(this.drawn - this.want)) this.paint();
        })
        .catch(() => {})
        .finally(() => {
          this.decoding.delete(i);
          this.fillWindow();
        });
    }
  }

  private nearestDecoded() {
    for (let d = 0; d < this.count; d++) {
      if (this.bitmaps.has(this.want - d)) return this.want - d;
      if (this.bitmaps.has(this.want + d)) return this.want + d;
    }
    return -1;
  }

  private paint() {
    const i = this.nearestDecoded();
    if (i < 0 || !this.ctx || i === this.drawn) return;
    const bmp = this.bitmaps.get(i)!;
    if (this.canvas.width !== bmp.width || this.canvas.height !== bmp.height) {
      this.canvas.width = bmp.width;
      this.canvas.height = bmp.height;
    }
    this.ctx.drawImage(bmp, 0, 0);
    this.drawn = i;
    this.canvas.dataset.frame = String(i); // for tests and debugging
    this.canvas.style.opacity = '1';
  }

  destroy() {
    this.dead = true;
    for (const bmp of this.bitmaps.values()) bmp.close();
    this.bitmaps.clear();
  }
}

/**
 * Sets up a canvas's frame sequence from its data attributes:
 *   data-frames="/scenes/<id>"  data-count-d="96"  data-count-m="96"  (optional) data-focus-m="0.5"
 * and starts loading it when `near` is within two screens.
 */
function sequenceFor(canvas: HTMLCanvasElement, near: Element, mobile: boolean): { seq: FrameSequence; stop: Cleanup } {
  const d = canvas.dataset;
  const variant = mobile ? 'm' : 'd';
  const count = Number((mobile ? d.countM : d.countD) ?? 1);
  const pad = (i: number) => String(i + 1).padStart(4, '0');
  const seq = new FrameSequence(canvas, (i) => `${d.frames}/${variant}/${pad(i)}.webp`, count, Number((mobile ? d.focusM : d.focusD) ?? 0.5));
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      seq.load();
      io.disconnect();
    }
  }, { rootMargin: '200% 0px' });
  io.observe(near);
  return {
    seq,
    stop: () => {
      io.disconnect();
      seq.destroy();
    },
  };
}

// ---------------------------------------------------------------------------
// Shared helpers

/**
 * Mirrors a tweened value onto the page on every animation frame, whenever it changes.
 *
 * Why not a tween's onUpdate: when the page's height changes, ScrollTrigger.refresh() rewinds each
 * timeline and restores it with callbacks suppressed, so anything driven from onUpdate would be
 * left at the rewound state. Tweened properties are always restored, so reading them each frame
 * keeps the scene and the charger screen true to the scroll position.
 */
function mirror<T extends Record<string, number>>(state: T, key: keyof T, apply: (v: number) => void): Cleanup {
  let last = Number.NaN;
  const tick = () => {
    const v = state[key] as number;
    if (v !== last) {
      last = v;
      apply(v);
    }
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}

/** A tween that moves a 0-1 playhead between two points of the scene. */
function scrub(head: { p: number }, from: number, to: number, duration: number) {
  // immediateRender: false, so building the timeline doesn't jump the playhead; ScrollTrigger renders the right frame.
  return gsap.fromTo(head, { p: from }, { p: to, duration, ease: 'none', immediateRender: false });
}

/** Adds will-change only while a ScrollTrigger is active, so idle layers don't hold GPU memory. */
function willChangeWhileActive(targets: Element[], value = 'transform, opacity') {
  return (active: boolean) => targets.forEach((t) => ((t as HTMLElement).style.willChange = active ? value : ''));
}

/** Holds a scroll scene's stage for the length of its track. */
const trackTrigger = (track: HTMLElement, scrubSeconds: number, onToggle?: (self: ScrollTrigger) => void): ScrollTrigger.Vars => ({
  trigger: track,
  start: 'top top',
  end: () => `+=${track.offsetHeight - window.innerHeight}`,
  scrub: scrubSeconds,
  invalidateOnRefresh: true,
  markers: markers(),
  onToggle,
});

// ---------------------------------------------------------------------------
// Robotic arm and crane

/**
 * Expected markup (see components/scenes/pull-transition.tsx):
 *   [data-pull]              wrapper
 *     [data-pull-track]      tall track: 100svh stage + phase 1 + 1 screen, CSS sets its height
 *       [data-pull-stage]    sticky, 100svh
 *         [data-pull-layer]  the still poster and the canvas
 *     [data-pull-next]       the next section, margin-top -100svh, z above, solid background
 */
export function pullScene(root: HTMLElement, clip: keyof typeof SCENES.gripAt): Cleanup {
  const track = root.querySelector<HTMLElement>('[data-pull-track]')!;
  const layer = root.querySelector<HTMLElement>('[data-pull-layer]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const grip = SCENES.gripAt[clip];
  const mm = gsap.matchMedia();

  mm.add({ motion: MOTION, mobile: MOBILE }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const mobile = !!ctx.conditions.mobile;
    const p1 = mobile ? SCENES.pull.phase1.mobile : SCENES.pull.phase1.desktop;
    const split = p1 / (p1 + 1); // share of the scroll that is phase 1
    const { seq, stop } = sequenceFor(canvas, track, mobile);
    const head = { p: 0 };
    const stopMirror = mirror(head, 'p', (p) => seq.draw(p));

    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: trackTrigger(track, SCENES.pull.scrub, (self) => willChangeWhileActive([layer])(self.isActive)) });
    // Phase 1: assembly / drop-in. The scene reaches the grip a little before phase 1 ends and
    // holds there, so the grip has happened before the next section starts to rise.
    tl.add(scrub(head, 0, grip, split * SCENES.pull.gripLead), 0);
    // Phase 2: the pull. The next section rises with the scroll (layout, no transform); the
    // scene drifts up with it and fades, so the lift reads as one motion.
    tl.add(scrub(head, grip, 1, 1 - split), split);
    tl.fromTo(layer, { yPercent: 0, autoAlpha: 1 }, { yPercent: SCENES.pull.layerRise, autoAlpha: SCENES.pull.layerFadeTo, duration: 1 - split, immediateRender: false }, split);

    return () => {
      stopMirror();
      stop();
    };
  });

  return () => mm.revert();
}

// ---------------------------------------------------------------------------
// EV charging

export type EvRefs = {
  track: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Updates the charger screen for a 0-100 value (text, bar, stats). */
  render: (pct: number) => void;
};

/**
 * Expected markup (see components/home/ev-charge-scene.tsx): a tall track with a sticky 100svh
 * stage holding the canvas, the intro text [data-ev=intro], the charger screen [data-ev=screen],
 * the glow [data-ev=glow] and a closing line [data-ev=outro].
 */
export function evChargeScene(root: HTMLElement, { track, canvas, render }: EvRefs): Cleanup {
  const q = gsap.utils.selector(root);
  const { plugEnd, screenIn, chargeStart } = SCENES.ev;
  const mm = gsap.matchMedia();

  mm.add({ motion: MOTION, reduced: '(prefers-reduced-motion: reduce)', mobile: MOBILE }, (ctx) => {
    const { motion, reduced, mobile } = ctx.conditions ?? {};
    if (reduced) {
      // A still: full battery beside the heading, nothing held or scrubbed.
      render(100);
      gsap.set(q('[data-ev=screen], [data-ev=outro], [data-ev=glow]'), { autoAlpha: 1 });
      return;
    }
    if (!motion) return;
    render(0);
    const { seq, stop } = sequenceFor(canvas, track, !!mobile);
    const head = { p: 0 };
    const charge = { pct: 0 };
    const stops = [mirror(head, 'p', (p) => seq.draw(p)), mirror(charge, 'pct', render), stop];

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: trackTrigger(track, SCENES.ev.scrub, (self) => willChangeWhileActive(q('[data-ev=screen], [data-ev=glow], [data-ev=intro]'))(self.isActive)),
    });
    // 1. The driver opens the port and plugs in
    tl.add(scrub(head, 0, 1, plugEnd), 0);
    tl.to(q('[data-ev=intro]'), { autoAlpha: 0, y: -30, duration: 0.12 }, plugEnd - 0.1);
    // 2. The charger's screen arrives
    tl.fromTo(q('[data-ev=screen]'), { autoAlpha: 0, y: 60, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.14, ease: EASE_OUT }, screenIn);
    tl.fromTo(q('[data-ev=glow]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, screenIn + 0.03);
    // 3. Charging: the bar fills (scaleX, inside render) and the percentage counts up
    tl.fromTo(charge, { pct: 0 }, { pct: 100, duration: 1 - chargeStart - 0.02, immediateRender: false }, chargeStart);
    tl.to(q('[data-ev=glow]'), { scale: 1.35, duration: 1 - chargeStart }, chargeStart);
    tl.fromTo(q('[data-ev=outro]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.9);

    return () => stops.forEach((s) => s());
  });

  return () => mm.revert();
}

// ---------------------------------------------------------------------------
// Page-wide refresh

/**
 * Keeps every ScrollTrigger's start and end true when the page's height changes after load:
 * web fonts arriving, images loading, orientation changes. Window resizes are handled by
 * ScrollTrigger itself. Call once per page; returns a cleanup.
 *
 * A refresh restores the scroll position after measuring, which would cut a smooth scroll (an
 * anchor link, the "Amey AI" nav item) short. So a pending refresh waits until scrolling has
 * been still for a moment.
 */
export function initSceneRefresh(): Cleanup {
  let timer = 0;
  let pending = false;
  const QUIET_MS = 250;
  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      pending = false;
      ScrollTrigger.refresh();
    }, QUIET_MS);
  };
  const refresh = () => {
    pending = true;
    schedule();
  };
  // Every scroll event pushes a pending refresh back until the page is still.
  const onScroll = () => pending && schedule();
  window.addEventListener('scroll', onScroll, { passive: true });
  document.fonts?.ready.then(refresh).catch(() => {});
  window.addEventListener('orientationchange', refresh);
  let lastHeight = document.body.scrollHeight;
  const ro = new ResizeObserver(() => {
    const h = document.body.scrollHeight;
    if (Math.abs(h - lastHeight) < 40) return;
    lastHeight = h;
    refresh();
  });
  ro.observe(document.body);
  // Phones: the address bar showing and hiding resizes the viewport; don't recalculate for that.
  ScrollTrigger.config({ ignoreMobileResize: true });
  return () => {
    clearTimeout(timer);
    ro.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('orientationchange', refresh);
  };
}
