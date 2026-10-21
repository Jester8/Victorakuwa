"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { latestBooks } from "@/data/books";

const hiddenKey = "pv-new-books-popup-disabled";

export default function NewBooksPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Readers arriving on a blog post (often from a shared link) shouldn't be interrupted.
    if (window.location.pathname.startsWith("/blog/")) return;

    try {
      if (window.localStorage.getItem(hiddenKey) === "1") return;
    } catch {
      // Continue showing the popup when the browser blocks local storage.
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [close, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.22 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-books-title"
            tabIndex={-1}
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 18,
              scale: prefersReducedMotion ? 1 : 0.98,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 10,
              scale: prefersReducedMotion ? 1 : 0.99,
            }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.28 }}
            className="relative my-auto max-h-[92svh] w-full max-w-3xl overflow-y-auto border border-line bg-background p-5 shadow-2xl sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close new books popup"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:right-6 sm:top-6"
            >
              <X size={18} />
            </button>

            <p className="pr-12 text-xs font-bold uppercase tracking-[0.18em] text-muted">
              New releases
            </p>
            <h2
              id="new-books-title"
              className="mt-3 max-w-2xl pr-8 text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
            >
              New books from Pastor Victor Akuwa
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Meet the latest titles and explore each book.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5">
              {latestBooks.map(({ slug, title, href, cover }) => (
                <article key={title} className="min-w-0">
                  <Link href={`/books/${slug}`} className="group block">
                    <div className="relative mx-auto aspect-[3/4] max-h-64 overflow-hidden border border-line bg-foreground/[0.03]">
                      <Image
                        src={cover}
                        alt={`${title} book cover`}
                        fill
                        sizes="(min-width: 640px) 280px, 42vw"
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <h3 className="mt-3 text-sm font-bold leading-snug sm:text-lg">
                      {title}
                    </h3>
                  </Link>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Purchase ${title}`}
                    className="mt-2 inline-flex min-h-9 items-center gap-2 text-xs font-bold underline decoration-line underline-offset-4 sm:text-sm"
                  >
                    Click to purchase
                    <ArrowUpRight size={14} />
                  </a>
                </article>
              ))}
            </div>

            <label className="mt-7 inline-flex cursor-pointer items-center gap-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setDontShowAgain(checked);
                  try {
                    if (checked) {
                      window.localStorage.setItem(hiddenKey, "1");
                    } else {
                      window.localStorage.removeItem(hiddenKey);
                    }
                  } catch {
                    // Keep the current preference in memory if storage is blocked.
                  }
                }}
                className="size-4 accent-foreground"
              />
              Don&rsquo;t show this again
            </label>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
