"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { books, type BookRelease } from "@/data/books";

function getCarouselMetrics(
  viewport: HTMLDivElement,
  variant: "standard" | "featured",
) {
  const group = viewport.firstElementChild as HTMLElement | null;
  const firstSlide = group?.firstElementChild as HTMLElement | null;
  if (!group || !firstSlide) return { step: 0, loopWidth: 0 };

  const width = viewport.clientWidth;
  const ratio =
    variant === "featured"
      ? width < 640
        ? 0.84
        : 0.64
      : width < 640
        ? 0.56
        : width < 1024
          ? (width - 64) / width / 3
          : (width - 96) / width / 6;
  viewport.style.setProperty(
    "--book-carousel-slide-width",
    `${Math.max(0, width * ratio)}px`,
  );

  const gap = Number.parseFloat(window.getComputedStyle(group).columnGap) || 0;
  return {
    step: firstSlide.getBoundingClientRect().width + gap,
    loopWidth: group.getBoundingClientRect().width,
  };
}

export default function BookCarousel({
  items = books,
  variant = "standard",
}: {
  items?: BookRelease[];
  variant?: "standard" | "featured";
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({ step: 0, loopWidth: 0 });
  const interactingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = viewport?.firstElementChild as HTMLElement | null;
    if (!viewport || !group || items.length < 2) return;

    const refreshMetrics = () => {
      metricsRef.current = getCarouselMetrics(viewport, variant);
    };

    refreshMetrics();
    const resizeObserver = new ResizeObserver(refreshMetrics);
    resizeObserver.observe(viewport);
    resizeObserver.observe(group);

    let frame = 0;
    let previousTime = performance.now();
    let previousIndex = -1;

    const animate = (time: number) => {
      const elapsed = Math.min(time - previousTime, 50);
      previousTime = time;

      const { step, loopWidth } = metricsRef.current;
      if (step > 0 && loopWidth > 0) {
        if (!interactingRef.current && time >= pauseUntilRef.current) {
          const currentPosition =
            ((viewport.scrollLeft % loopWidth) + loopWidth) % loopWidth;
          const speed = prefersReducedMotion ? 18 : 44;
          let nextPosition = currentPosition + (elapsed * speed) / 1000;
          if (nextPosition >= loopWidth) nextPosition -= loopWidth;
          viewport.scrollLeft = nextPosition;
        }

        const position =
          ((viewport.scrollLeft % loopWidth) + loopWidth) % loopWidth;
        const currentIndex = Math.min(
          Math.floor(position / step),
          items.length - 1,
        );
        if (currentIndex !== previousIndex) {
          previousIndex = currentIndex;
          setActiveIndex(currentIndex);
        }
      }

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [items.length, prefersReducedMotion, variant]);

  const move = useCallback(
    (direction: -1 | 1) => {
      const viewport = viewportRef.current;
      if (!viewport || items.length < 2) return;

      const { step, loopWidth } = metricsRef.current;
      if (step <= 0 || loopWidth <= 0) return;

      let current = viewport.scrollLeft;
      if (direction < 0 && current < step) {
        current += loopWidth;
        viewport.scrollLeft = current;
      }

      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const target = Math.max(
        0,
        Math.min(current + direction * step, maxScroll),
      );
      pauseUntilRef.current = performance.now() + 900;
      viewport.scrollTo({
        left: target,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [items.length, prefersReducedMotion],
  );

  const renderSlides = (copy = 0) =>
    items.map(({ slug, title, href, cover, amazonHref }, index) => (
      <article
        key={`${title}-${copy}`}
        className={`book-carousel-slide flex min-w-0 border border-line bg-background ${
          variant === "featured"
            ? "min-h-52 flex-row items-center gap-4 p-3 sm:gap-6 sm:p-4"
            : "flex-col p-2 sm:p-3"
        }`}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${items.length}: ${title}`}
      >
        <Link
          href={`/books/${slug}`}
          tabIndex={copy > 0 ? -1 : undefined}
          className={`relative block overflow-hidden bg-foreground/[0.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
            variant === "featured"
              ? "aspect-[3/4] w-[34%] max-w-36 shrink-0 sm:w-[32%]"
              : "aspect-[4/5] w-full"
          }`}
          aria-label={`Read about ${title}`}
        >
          <Image
            src={cover}
            alt={`${title} book cover`}
            fill
            sizes={
              variant === "featured"
                ? "(min-width: 640px) 144px, 34vw"
                : "(min-width: 1024px) 16vw, (min-width: 640px) 32vw, 56vw"
            }
            className={`object-contain transition-transform duration-500 hover:scale-[1.03] ${
              variant === "featured" ? "p-1" : "p-0"
            }`}
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          {variant === "featured" && (
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted sm:text-xs">
              Latest release
            </p>
          )}
          <h3
            className={`text-xl font-bold leading-snug tracking-tight ${
              variant === "featured"
                ? "mt-2 sm:mt-3 sm:text-2xl"
                : "mt-2 text-sm sm:text-base"
            }`}
          >
            <Link
              href={`/books/${slug}`}
              tabIndex={copy > 0 ? -1 : undefined}
              className="transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {title}
            </Link>
          </h3>
          <div
            className={`flex min-h-7 flex-wrap gap-x-2 gap-y-1 pt-1.5 ${
              variant === "featured" ? "mt-auto" : "mt-2"
            }`}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={copy > 0 ? -1 : undefined}
              aria-label={`Purchase ${title}`}
              className="inline-flex min-h-8 items-center gap-1.5 text-xs font-bold underline decoration-line underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Click to purchase
              <ArrowUpRight size={14} />
            </a>
            {amazonHref && (
              <a
                href={amazonHref}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={copy > 0 ? -1 : undefined}
                aria-label={`View ${title} on Amazon`}
                className="inline-flex min-h-8 items-center gap-1.5 text-xs font-bold underline decoration-line underline-offset-4 transition-colors hover:decoration-foreground sm:text-sm"
              >
                Amazon
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </article>
    ));

  return (
    <div
      className={`mt-10 sm:mt-12 ${
        variant === "featured" ? "book-carousel-featured" : ""
      }`}
    >
      <div
        ref={viewportRef}
        className="book-carousel-viewport flex overflow-x-auto"
        aria-label={
          variant === "featured"
            ? "Latest books by Pastor Victor Akuwa"
            : "Books by Pastor Victor Akuwa"
        }
        aria-roledescription="carousel"
        role="region"
        onPointerDown={() => {
          interactingRef.current = true;
        }}
        onPointerUp={() => {
          interactingRef.current = false;
          pauseUntilRef.current = performance.now() + 450;
        }}
        onPointerCancel={() => {
          interactingRef.current = false;
        }}
        onWheel={() => {
          pauseUntilRef.current = performance.now() + 900;
        }}
      >
        {[0, 1, 2].map((copy) => (
          <div
            key={`book-copy-${copy}`}
            className="book-carousel-group flex shrink-0 items-stretch gap-4 pr-4"
            aria-hidden={copy > 0 ? true : undefined}
          >
            {renderSlides(copy)}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted" aria-live="off" aria-atomic="true">
          {activeIndex + 1} <span aria-hidden="true">/</span> {items.length}
          <span className="sr-only"> carousel position</span>
        </p>
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Book carousel controls"
        >
          <button
            type="button"
            aria-label="Previous books"
            onClick={() => move(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next books"
            onClick={() => move(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
