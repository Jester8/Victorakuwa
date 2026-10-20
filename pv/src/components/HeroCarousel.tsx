"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

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
  const [activeSlide, setActiveSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion !== false) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const showSlide = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <section
      aria-label="Featured photographs"
      aria-roledescription="carousel"
      className="relative flex h-[88svh] min-h-[560px] max-h-[860px] w-full items-end overflow-hidden bg-background"
    >
      <div className="absolute inset-0" aria-live="off">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slides[activeSlide].src}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.7,
              ease: "easeOut",
            }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeSlide + 1} of ${slides.length}`}
          >
            <Image
              src={slides[activeSlide].src}
              alt={slides[activeSlide].alt}
              fill
              preload={activeSlide === 0}
              sizes="100vw"
              className="object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>
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
                aria-pressed={activeSlide === index}
                onClick={() => showSlide(index)}
                className={`h-2.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                  activeSlide === index
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => showSlide(activeSlide - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/65 text-white transition-colors hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft size={17} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => showSlide(activeSlide + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/65 text-white transition-colors hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
