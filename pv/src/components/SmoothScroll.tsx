"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion, useSiteSettings } from "@/components/SiteSettings";

/** Eased page scrolling. The library is only downloaded when the admin has it switched on. */
export default function SmoothScroll() {
  const { smoothScroll } = useSiteSettings();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!smoothScroll || reduced) return;
    let cancelled = false;
    let destroy = () => {};

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      let rafId = 0;
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      destroy = () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      destroy();
    };
  }, [smoothScroll, reduced]);

  return null;
}
