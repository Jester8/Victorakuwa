"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { usePrefersReducedMotion, useSiteSettings } from "@/components/SiteSettings";

const slides = [
  {
    src: "/hero/slide-01-writing.webp",
    alt: "Pastor Victor Akuwa writing at his desk.",
  },
  {
    src: "/hero/slide-02-reflection.webp",
    alt: "Pastor Victor Akuwa reflecting at his desk.",
  },
  {
    src: "/hero/slide-03-portrait.webp",
    alt: "Portrait of Pastor Victor Akuwa seated at his desk.",
  },
  {
    src: "/hero/slide-04-profile.webp",
    alt: "Pastor Victor Akuwa looking to the side from his desk.",
  },
];

export default function HeroCarousel({ children }: { children: ReactNode }) {
  const { heroAutoplay, heroSeconds } = useSiteSettings();
  // Only the current and previous slides are mounted, so later photos download when they're due.
  const [{ active, previous }, setSlides] = useState({ active: 0, previous: -1 });
  const reduced = usePrefersReducedMotion();

  const showSlide = (index: number) => {
    setSlides(({ active: current }) => {
      const next = (index + slides.length) % slides.length;
      return next === current ? { active: current, previous: -1 } : { active: next, previous: current };
    });
  };

  useEffect(() => {
    if (!heroAutoplay || reduced) return;
    const timer = window.setInterval(() => {
      setSlides(({ active: current }) => ({ active: (current + 1) % slides.length, previous: current }));
    }, heroSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [heroAutoplay, heroSeconds, reduced, active]);

  return (
    <section
      aria-label="Featured photographs"
      aria-roledescription="carousel"
      className="relative flex h-[88svh] min-h-[560px] max-h-[860px] w-full items-end overflow-hidden bg-background"
    >
      <div className="absolute inset-0" aria-live="off">
        {[previous, active].map((index) =>
          index < 0 ? null : (
            <div
              key={slides[index].src}
              className={`absolute inset-0 ${index === active && previous >= 0 ? "hero-slide-in" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={index !== active}
            >
              <Image
                src={slides[index].src}
                alt={slides[index].alt}
                fill
                preload={index === 0}
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
          )
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      <div className="container-px relative w-full pb-6 sm:pb-9">
        {children}

        <div
          className="mt-6 flex items-center justify-between gap-3"
          role="group"
          aria-label="Carousel controls"
        >
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={active === index}
                onClick={() => showSlide(index)}
                className={`h-2.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                  active === index
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
