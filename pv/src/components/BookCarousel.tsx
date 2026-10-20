"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { books, type BookRelease } from "@/data/books";

function getCarouselLayout(viewport: HTMLDivElement) {
  const firstSlide = viewport.firstElementChild as HTMLElement | null;
  if (!firstSlide) return { step: 0, maxIndex: 0 };

  const gap = Number.parseFloat(window.getComputedStyle(viewport).columnGap) || 0;
  const step = firstSlide.getBoundingClientRect().width + gap;
  const visibleCount = Math.max(
    1,
    Math.floor((viewport.clientWidth + gap) / step),
  );

  return {
    step,
    maxIndex: Math.max(0, viewport.children.length - visibleCount),
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
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const scrollToIndex = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const { step, maxIndex } = getCarouselLayout(viewport);
      const targetIndex = Math.min(Math.max(index, 0), maxIndex);
      viewport.scrollTo({
        left: targetIndex * step,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      setActiveIndex(targetIndex);
    },
    [prefersReducedMotion],
  );

  const updateActiveIndex = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { step, maxIndex } = getCarouselLayout(viewport);
    if (!step) return;

    const currentIndex = Math.min(
      Math.max(Math.round(viewport.scrollLeft / step), 0),
      maxIndex,
    );
    setActiveIndex((previous) =>
      previous === currentIndex ? previous : currentIndex,
    );
  }, []);

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { maxIndex } = getCarouselLayout(viewport);
    const nextIndex =
      direction > 0
        ? activeIndex >= maxIndex
          ? 0
          : activeIndex + 1
        : activeIndex <= 0
          ? maxIndex
          : activeIndex - 1;
    scrollToIndex(nextIndex);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    updateActiveIndex();
    window.addEventListener("resize", updateActiveIndex);
    return () => window.removeEventListener("resize", updateActiveIndex);
  }, [updateActiveIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const { maxIndex } = getCarouselLayout(viewport);
      if (maxIndex === 0) return;
      scrollToIndex(activeIndex >= maxIndex ? 0 : activeIndex + 1);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [activeIndex, scrollToIndex]);

  return (
    <div
      className={`mt-10 sm:mt-12 ${
        variant === "featured" ? "book-carousel-featured" : ""
      }`}
    >
      <div
        ref={viewportRef}
        className="book-carousel-viewport flex gap-4 overflow-x-auto pb-3"
        onScroll={updateActiveIndex}
        aria-label={
          variant === "featured"
            ? "Latest books by Pastor Victor Akuwa"
            : "Books by Pastor Victor Akuwa"
        }
        aria-roledescription="carousel"
        role="region"
      >
        {items.map(({ slug, title, href, cover, amazonHref }, index) => (
          <article
            key={title}
            className={`book-carousel-slide flex min-w-0 border border-line bg-background p-4 sm:p-5 ${
              variant === "featured"
                ? "min-h-56 flex-row items-center gap-4 sm:gap-6"
                : "flex-col"
            }`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}: ${title}`}
          >
            <Link
              href={`/books/${slug}`}
              className={`relative block aspect-[3/4] overflow-hidden bg-foreground/[0.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
                variant === "featured" ? "w-[32%] max-w-40 shrink-0" : "w-full"
              }`}
              aria-label={`Read about ${title}`}
            >
              <Image
                src={cover}
                alt={`${title} book cover`}
                fill
                sizes={
                  variant === "featured"
                    ? "(min-width: 640px) 160px, 32vw"
                    : "(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 86vw"
                }
                className="object-contain p-2 transition-transform duration-500 hover:scale-[1.03]"
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
                    : "mt-5 min-h-[5.25rem]"
                }`}
              >
                <Link
                  href={`/books/${slug}`}
                  className="transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {title}
                </Link>
              </h3>
              <div className="mt-auto flex min-h-10 flex-wrap gap-x-5 gap-y-2 pt-4">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Purchase ${title}`}
                  className={`inline-flex min-h-10 items-center gap-2 font-bold underline decoration-line underline-offset-4 transition-colors hover:decoration-foreground ${
                    variant === "featured" ? "text-xs sm:text-sm" : "text-sm"
                  }`}
                >
                  Click to purchase
                  <ArrowUpRight size={15} />
                </a>
                {amazonHref && (
                  <a
                    href={amazonHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${title} on Amazon`}
                    className="inline-flex min-h-10 items-center gap-2 text-sm font-bold underline decoration-line underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    Amazon
                    <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted" aria-live="off" aria-atomic="true">
          {activeIndex + 1} <span aria-hidden="true">/</span> {items.length}
          <span className="sr-only"> carousel position</span>
        </p>
        <div className="flex items-center gap-2" role="group" aria-label="Book carousel controls">
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
