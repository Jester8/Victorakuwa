import Image from "next/image";
import { BookOpen } from "lucide-react";
import Reveal from "@/components/Reveal";
import BookCarousel from "@/components/BookCarousel";

export const metadata = {
  title: "Books | Pastor Victor Akuwa",
  description:
    "Explore books by Pastor Victor Akuwa and learn more about each title.",
};

export default function Books() {
  return (
    <>
      <section className="container-px grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:py-24">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Books by Victor Akuwa
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Biblical truth for everyday life.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Explore PV&rsquo;s books on faith, Scripture, and the life of a
            believer. Open a title to read more and find a purchase link.
          </p>
          <a
            href="#titles"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            Browse the titles
            <BookOpen size={16} />
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-line bg-background shadow-sm md:ml-auto">
            <div className="relative h-full overflow-hidden">
              <Image
                src="/photos/IMG_8138.webp"
                alt="Pastor Victor Akuwa reflecting at his desk."
                fill
                priority
                sizes="(min-width: 1024px) 38vw, (min-width: 768px) 44vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.035]"
              />
            </div>
          </div>
        </Reveal>
      </section>

      <section
        id="titles"
        className="border-y border-line bg-background py-16 sm:py-20 lg:py-24"
      >
        <div className="container-px">
          <Reveal>
          <p className="text-sm font-bold uppercase tracking-widest text-muted">
              The book collection
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Choose a title to continue.
            </h2>
          </Reveal>

          <BookCarousel />
        </div>
      </section>
    </>
  );
}
