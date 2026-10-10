import { SiteFooter } from '@/components/site/site-footer';
import { MobileStartBar, SiteHeader } from '@/components/site/site-header';
import { SmoothScroll } from '@/components/system/smooth-scroll';
import { MotionProvider } from '@/components/site/motion-provider';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-signal focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <MobileStartBar />
    </MotionProvider>
  );
}
