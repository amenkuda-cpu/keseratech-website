// Scroll-driven video scenes for the home page, one function per scene:
//
//   pullScene()    robotic arm and crane: the clip scrubs with the scroll, then the next section
//                  rises over it as if the arm / hook were lifting it into view
//   evChargeScene() EV charging: the clip scrubs while a charger screen fills to 100 %
//   sprinklerScene() finale: a full-screen splash washes in the closing call to action
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
    /** Scroll length of phase 1 (clip plays, nothing covers it), desktop / phone. Phase 2 is always 1 screen. */
    phase1: { desktop: 1.2, mobile: 0.6 },
    /** ScrollTrigger scrub smoothing in seconds (true = instant). */
    scrub: 1,
    /** How far the video layer drifts up (yPercent) while the next section lifts in, and where it fades to. */
    videoRise: -22,
    videoFadeTo: 0.25,
    /** The next section grows from this scale to 1 as it is lifted, from its top edge. */
    nextFromScale: 0.94,
  },
  /** Fraction of each clip where the grip happens: phase 1 plays up to here, phase 2 plays the rest. */
  gripAt: { 'robotic-arm': 0.74, crane: 0.72 },
  ev: {
    // How long the EV stage is held (2.6 screens desktop, 1.8 phone) is the .ev-track height in globals.css.
    scrub: 0.6,
    /** Timeline split (0-1): clip plays until `plugEnd`, screen appears at `screenIn`, charging runs `chargeStart`-1. */
    plugEnd: 0.5,
    screenIn: 0.42,
    chargeStart: 0.56,
  },
  sprinkler: {
    scrub: 0.8,
    /** The splash ends when the closing section's top reaches this point of the viewport. */
    endAt: '35%',
    /** Timeline split (0-1): overlay fades in by `fadeIn`, content wipes in `revealStart`-`revealEnd`, overlay fades out from `fadeOut`. */
    fadeIn: 0.12,
    revealStart: 0.45,
    revealEnd: 0.9,
    fadeOut: 0.78,
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
  const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && start(), { rootMargin: '100% 0px' });
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

/** The video's playhead as a 0-1 fraction of its length, kept on screen by mirror(). */
function playhead(video: HTMLVideoElement) {
  const state = { p: 0 };
  const stop = mirror(state, 'p', (p) => {
    if (video.readyState >= 1 && video.duration) video.currentTime = Math.min(video.duration - 0.04, p * video.duration);
  });
  return { state, stop };
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
  const next = root.querySelector<HTMLElement>('[data-pull-next]')!;
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
            onToggle: (self) => willChangeWhileActive([layer, next])(self.isActive),
          },
        });
        // Phase 1: assembly / drop-in, up to the grip
        tl.add(scrub(head.state, 0, grip, split), 0);
        // Phase 2: the pull. The next section rises with the scroll (layout), and grows from its
        // top edge; the video layer drifts up with it and fades, so the lift reads as one motion.
        tl.add(scrub(head.state, grip, 1, 1 - split), split);
        tl.fromTo(layer, { yPercent: 0, autoAlpha: 1 }, { yPercent: SCENES.pull.videoRise, autoAlpha: SCENES.pull.videoFadeTo, duration: 1 - split }, split);
        tl.fromTo(next, { scale: SCENES.pull.nextFromScale, transformOrigin: '50% 0%' }, { scale: 1, duration: 1 - split, ease: EASE_OUT }, split);
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
// Sprinkler finale

/**
 * Expected markup (see components/scenes/sprinkler-finale.tsx):
 *   [data-sprinkler]            wrapper around the closing section
 *     [data-sprinkler-overlay]  position: fixed, full viewport, pointer-events: none, hidden
 *       video
 *     [data-sprinkler-content]  the closing section, revealed with a clip-path wipe
 */
export function sprinklerScene(root: HTMLElement): Cleanup {
  const overlay = root.querySelector<HTMLElement>('[data-sprinkler-overlay]')!;
  const video = overlay.querySelector('video')!;
  const content = root.querySelector<HTMLElement>('[data-sprinkler-content]')!;
  const { fadeIn, revealStart, revealEnd, fadeOut } = SCENES.sprinkler;
  const mm = gsap.matchMedia();

  mm.add({ motion: MOTION, mobile: MOBILE }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const stops: Cleanup[] = [];
    const stopLoading = loadWhenNear(video, root, !!ctx.conditions.mobile, () =>
      buildIn(ctx, () => {
        const head = playhead(video);
        stops.push(head.stop);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: content,
            // From the moment the closing section peeks in until its top is `endAt` down the
            // viewport, so the splash has always finished by the time the call to action is in
            // view. clamp() keeps both points reachable however short the page below is.
            start: 'clamp(top bottom)',
            end: `clamp(top ${SCENES.sprinkler.endAt})`,
            scrub: SCENES.sprinkler.scrub,
            invalidateOnRefresh: true,
            markers: markers(),
            onToggle: (self) => willChangeWhileActive([overlay, content], 'opacity, clip-path')(self.isActive),
          },
        });
        tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: fadeIn }, 0);
        tl.add(scrub(head.state, 0, 1, fadeOut + 0.1), 0);
        tl.fromTo(content, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: revealEnd - revealStart, ease: 'power1.inOut' }, revealStart);
        tl.to(overlay, { autoAlpha: 0, duration: 1 - fadeOut }, fadeOut);
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
