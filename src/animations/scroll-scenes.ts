// Scroll-driven video scenes for the home page, one function per scene:
//
//   pullScene()    robotic arm and crane: the clip scrubs with the scroll, then the next section
//                  rises over it as if the arm / hook were lifting it into view
//   evChargeScene() EV charging: the clip scrubs while a charger screen fills to 100 %
//
// Layout is plain CSS (sticky stages inside tall "tracks", see the scene components), so the page
// has no layout shift, works without JavaScript and never jumps when a pin starts. GSAP only
// scrubs the videos and animates transform/opacity/clip-path on top of that layout.
//
// Every scene:
// - builds nothing for people who prefer reduced motion (they see the poster and the content);
// - loads its video only when the section is within one viewport (IntersectionObserver), picks the
//   9:16 "-mobile" file under 768 px, and builds its timeline after `loadedmetadata`;
// - keeps the poster and a usable page if the video fails to load;
// - returns a cleanup function (call it on unmount; the React wrappers use useGSAP for this).
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
     * Scroll length of phase 1 (the clip builds up to the grip, nothing covers it), desktop / phone.
     * Phase 2 (the lift) is always 1 screen. Must match --pull-p1 in globals.css.
     */
    phase1: { desktop: 2, mobile: 1.2 },
    /**
     * The clip reaches the grip this far into phase 1, then holds on it briefly, so the grip has
     * always happened before the next section starts to rise.
     */
    gripLead: 0.85,
    /**
     * ScrollTrigger scrub smoothing in seconds. Kept short: the next section moves exactly with
     * the scroll, so a long smoothing lets it arrive before the video has caught up.
     */
    scrub: 0.25,
    /** How far the video layer drifts up (yPercent) while the next section lifts in, and where it fades to. */
    videoRise: -22,
    videoFadeTo: 0.25,
    // The next section is not scaled while it lifts: scaling a whole tall section made the browser
    // redraw it every frame. It rises with the scroll itself, which costs nothing.
  },
  /** Fraction of each clip where the grip has happened: phase 1 plays up to here, phase 2 plays the rest. */
  gripAt: { 'robotic-arm': 0.8, crane: 0.72 },
  ev: {
    // How long the EV stage is held (2.6 screens desktop, 1.8 phone) is the .ev-track height in globals.css.
    scrub: 0.6,
    /** Timeline split (0-1): clip plays until `plugEnd`, screen appears at `screenIn`, charging runs `chargeStart`-1. */
    plugEnd: 0.5,
    screenIn: 0.42,
    chargeStart: 0.56,
  },
};

const MOBILE = '(max-width: 767px)';
const MOTION = '(prefers-reduced-motion: no-preference)';
const markers = () => typeof location !== 'undefined' && new URLSearchParams(location.search).has('markers');

// ---------------------------------------------------------------------------
// Shared helpers

type Cleanup = () => void;

/**
 * Gives a <video> its sources once `near` is within one viewport, then calls `ready` after
 * `loadedmetadata`. The video's data attributes name the files:
 *   data-mp4, data-webm (desktop) and data-mp4-mobile, data-webm-mobile (optional, under 768 px).
 */
function loadWhenNear(video: HTMLVideoElement, near: Element, mobile: boolean, ready: () => gsap.core.Timeline): Cleanup {
  let done = false;
  const start = () => {
    if (done) return;
    done = true;
    io.disconnect();
    const d = video.dataset;
    const mp4 = (mobile && d.mp4Mobile) || d.mp4;
    const webm = (mobile && d.webmMobile) || d.webm;
    const poster = (mobile && d.posterMobile) || d.poster;
    if (poster) video.poster = poster;
    video.replaceChildren(
      ...[mp4 && Object.assign(document.createElement('source'), { src: mp4, type: 'video/mp4' }), webm && Object.assign(document.createElement('source'), { src: webm, type: 'video/webm' })].filter(Boolean) as HTMLSourceElement[],
    );
    video.addEventListener('loadedmetadata', onMeta, { once: true });
    video.addEventListener('loadeddata', unlockSeeking, { once: true });
    video.load();
  };
  const onMeta = () => {
    const tl = ready();
    // No ScrollTrigger.refresh() here: the layout never depends on the video, and a refresh in
    // the middle of a smooth scroll (an anchor link passing this scene) would stop it part-way.
    // Someone who lands mid-scene (a reload, or a link to a section further down) gets the
    // right frame straight away, not after their next scroll: make ScrollTrigger read the current
    // scroll position now, then skip the scrub smoothing for this one jump.
    ScrollTrigger.update();
    tl.scrollTrigger?.getTween()?.progress(1);
  };
  // iOS only lets a video seek once it has played: play and pause it silently.
  const unlockSeeking = () => video.play().then(() => video.pause()).catch(() => {});
  // Start loading a screen and a half early, so slower connections have the clip in time.
  const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && start(), { rootMargin: '150% 0px' });
  io.observe(near);
  return () => {
    io.disconnect();
    video.removeEventListener('loadedmetadata', onMeta);
    video.removeEventListener('loadeddata', unlockSeeking);
  };
}

/**
 * Mirrors a tweened value onto the page on every animation frame, whenever it changes.
 *
 * Why not a tween's onUpdate: when the page's height changes, ScrollTrigger.refresh() rewinds each
 * timeline and restores it with callbacks suppressed, so anything driven from onUpdate is left at
 * the rewound state (a clip stuck on frame 0). Tweened properties are always restored, so reading
 * them each frame keeps the video and the charger screen true to the scroll position.
 * Call inside a gsap context: the returned function is its cleanup.
 */
function mirror<T extends Record<string, number>>(state: T, key: keyof T, apply: (v: number) => void) {
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

/**
 * The video's playhead as a 0-1 fraction of its length, kept on screen by mirror().
 * Seeks never pile up: while the decoder is still busy with one, only the latest target is kept
 * and applied when it finishes (piled-up seeks were a main cause of scroll lag on slower laptops).
 */
function playhead(video: HTMLVideoElement) {
  const state = { p: 0 };
  let pending: number | null = null;
  const seekTo = (p: number) => {
    if (!(video.readyState >= 1 && video.duration)) return;
    const t = Math.min(video.duration - 0.04, p * video.duration);
    if (Math.abs(video.currentTime - t) < 0.02) return; // within a frame: nothing to do
    video.currentTime = t;
  };
  const onSeeked = () => {
    if (pending === null) return;
    const p = pending;
    pending = null;
    seekTo(p);
  };
  video.addEventListener('seeked', onSeeked);
  const stopMirror = mirror(state, 'p', (p) => {
    if (video.seeking) pending = p;
    else seekTo(p);
  });
  return {
    state,
    stop: () => {
      stopMirror();
      video.removeEventListener('seeked', onSeeked);
    },
  };
}

/** A tween that moves a playhead between two fractions of the clip. */
function scrub(head: { p: number }, from: number, to: number, duration: number) {
  // immediateRender: false, so building the timeline doesn't jump the playhead; ScrollTrigger renders the right frame.
  return gsap.fromTo(head, { p: from }, { p: to, duration, ease: 'none', immediateRender: false });
}

/** Builds a scene's timeline inside a gsap context (so it is reverted with it) and returns it. */
function buildIn(ctx: gsap.Context, build: () => gsap.core.Timeline) {
  let tl!: gsap.core.Timeline;
  ctx.add(() => {
    tl = build();
  });
  return tl;
}

/** Adds will-change only while a ScrollTrigger is active, so idle layers don't hold GPU memory. */
function willChangeWhileActive(targets: Element[], value = 'transform, opacity') {
  return (active: boolean) => targets.forEach((t) => ((t as HTMLElement).style.willChange = active ? value : ''));
}

// ---------------------------------------------------------------------------
// Robotic arm and crane

/**
 * Expected markup (see components/scenes/pull-transition.tsx):
 *   [data-pull]            wrapper
 *     [data-pull-track]    tall track: 100svh stage + phase 1 + 1 screen, CSS sets its height
 *       [data-pull-stage]  sticky, 100svh
 *         [data-pull-video-layer] > video
 *     [data-pull-next]     the next section, margin-top -100svh, z above, solid background
 */
export function pullScene(root: HTMLElement, clip: keyof typeof SCENES.gripAt): Cleanup {
  const track = root.querySelector<HTMLElement>('[data-pull-track]')!;
  const layer = root.querySelector<HTMLElement>('[data-pull-video-layer]')!;
  const video = root.querySelector<HTMLVideoElement>('video')!;
  const grip = SCENES.gripAt[clip];
  const mm = gsap.matchMedia();

  mm.add({ motion: MOTION, mobile: MOBILE }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const mobile = !!ctx.conditions.mobile;
    const p1 = mobile ? SCENES.pull.phase1.mobile : SCENES.pull.phase1.desktop;
    const split = p1 / (p1 + 1); // share of the scroll that is phase 1

    const stops: Cleanup[] = [];
    const stopLoading = loadWhenNear(video, track, mobile, () =>
      buildIn(ctx, () => {
        const head = playhead(video);
        stops.push(head.stop);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: track,
            start: 'top top',
            end: () => `+=${track.offsetHeight - window.innerHeight}`,
            scrub: SCENES.pull.scrub,
            invalidateOnRefresh: true,
            markers: markers(),
            onToggle: (self) => willChangeWhileActive([layer])(self.isActive),
          },
        });
        // Phase 1: assembly / drop-in. The clip reaches the grip a little before phase 1 ends and
        // holds there, so the grip has happened before the next section starts to rise.
        tl.add(scrub(head.state, 0, grip, split * SCENES.pull.gripLead), 0);
        // Phase 2: the pull. The next section rises with the scroll (layout, no transform); the
        // video layer drifts up with it and fades, so the lift reads as one motion.
        tl.add(scrub(head.state, grip, 1, 1 - split), split);
        tl.fromTo(layer, { yPercent: 0, autoAlpha: 1 }, { yPercent: SCENES.pull.videoRise, autoAlpha: SCENES.pull.videoFadeTo, duration: 1 - split }, split);
        return tl;
      }),
    );
    return () => {
      stopLoading();
      stops.forEach((stop) => stop());
    };
  });

  return () => mm.revert();
}

// ---------------------------------------------------------------------------
// EV charging

export type EvRefs = {
  track: HTMLElement;
  video: HTMLVideoElement;
  /** Updates the charger screen for a 0-100 value (text, bar, stats). */
  render: (pct: number) => void;
};

/**
 * Expected markup (see components/home/ev-charge-scene.tsx): a tall track with a sticky 100svh
 * stage holding the video, the intro text [data-ev=intro], the charger screen [data-ev=screen],
 * the glow [data-ev=glow] and a closing line [data-ev=outro].
 */
export function evChargeScene(root: HTMLElement, { track, video, render }: EvRefs): Cleanup {
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
    const stops: Cleanup[] = [];
    const stopLoading = loadWhenNear(video, track, !!mobile, () =>
      buildIn(ctx, () => {
        const head = playhead(video);
        const charge = { pct: 0 };
        stops.push(head.stop, mirror(charge, 'pct', render));
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: track,
            start: 'top top',
            end: () => `+=${track.offsetHeight - window.innerHeight}`,
            scrub: SCENES.ev.scrub,
            invalidateOnRefresh: true,
            markers: markers(),
            onToggle: (self) => willChangeWhileActive(q('[data-ev=screen], [data-ev=glow], [data-ev=intro]'))(self.isActive),
          },
        });
        // 1. The driver opens the port and plugs in
        tl.add(scrub(head.state, 0, 1, plugEnd), 0);
        tl.to(q('[data-ev=intro]'), { autoAlpha: 0, y: -30, duration: 0.12 }, plugEnd - 0.1);
        // 2. The charger's screen arrives
        tl.fromTo(q('[data-ev=screen]'), { autoAlpha: 0, y: 60, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.14, ease: EASE_OUT }, screenIn);
        tl.fromTo(q('[data-ev=glow]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, screenIn + 0.03);
        // 3. Charging: the bar fills (scaleX, inside render) and the percentage counts up
        tl.fromTo(charge, { pct: 0 }, { pct: 100, duration: 1 - chargeStart - 0.02, immediateRender: false }, chargeStart);
        tl.to(q('[data-ev=glow]'), { scale: 1.35, duration: 1 - chargeStart }, chargeStart);
        tl.fromTo(q('[data-ev=outro]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.9);
        return tl;
      }),
    );
    return () => {
      stopLoading();
      stops.forEach((stop) => stop());
    };
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
