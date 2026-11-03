"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { usePrefersReducedMotion, useSiteSettings } from "@/components/SiteSettings";

export default function ScrollToTop() {
  const { scrollToTop } = useSiteSettings();
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!scrollToTop) return;
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollToTop]);

  if (!scrollToTop) return null;
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
      className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-background text-foreground shadow-sm transition-[opacity,translate,background-color,color] duration-300 hover:bg-foreground hover:text-background sm:bottom-8 sm:right-8 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={18} strokeWidth={2} />
    </button>
  );
}
