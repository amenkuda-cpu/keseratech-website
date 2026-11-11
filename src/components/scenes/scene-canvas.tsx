import frames from '@/content/scene-frames.json';

type SceneId = keyof typeof frames;

/**
 * A scroll scene's picture: the scene's first frame as a plain image (what people without
 * JavaScript, or with reduced motion, see), and over it the canvas that scroll-scenes.ts draws
 * the frame sequence on. Fills its positioned parent.
 */
export function SceneCanvas({ scene, focusMobile }: { scene: SceneId; /** 0-1 horizontal crop focus on phones */ focusMobile?: number }) {
  const base = `/scenes/${scene}`;
  return (
    <>
      <picture>
        <source media="(max-width: 767px)" srcSet={`${base}/m/0001.webp`} />
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from the sequence; next/image adds nothing here */}
        <img src={`${base}/d/0001.webp`} alt="" aria-hidden className="absolute inset-0 size-full object-cover" decoding="async" />
      </picture>
      <canvas
        aria-hidden
        data-frames={base}
        data-count-d={frames[scene].d}
        data-count-m={frames[scene].m}
        data-focus-m={focusMobile}
        className="absolute inset-0 size-full opacity-0"
      />
    </>
  );
}
