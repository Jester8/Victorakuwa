import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";

export const metadata = {
  title: "Books | Pastor Victor Akuwa",
  description:
    "Books by Pastor Victor Akuwa, making biblical truth simple, practical, and accessible.",
};

const placeholders = [
  { label: "Book One" },
  { label: "Book Two" },
  { label: "Book Three" },
];

export default function Books() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[85vh] min-h-[560px] w-full items-end overflow-hidden">
        <Image
          src="/pv4.jpeg"
          alt="Pastor Victor Akuwa, author"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

        <div className="container-px relative w-full pb-16 sm:pb-24">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Books
            </p>
          </Reveal>
          <TypewriterHeading
            text="Biblical truth, made simple and practical."
            className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
          >
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              As the author of several books, PV has consistently made
              biblical truth simple, practical, and accessible, helping
              believers develop strong Christian foundations and mature in
              their walk with God.
            </p>
          </TypewriterHeading>
        </div>
      </section>

      {/* Books grid */}
      <section className="border-t border-line py-20 sm:py-28">
        <div className="container-px">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Titles
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              New releases coming soon.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {placeholders.map(({ label }, i) => (
              <Reveal key={label} delay={i * 0.08}>
                <div className="group">
                  <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-foreground/[0.03] transition-colors group-hover:border-foreground">
                    <BookOpen
                      size={32}
                      strokeWidth={1.25}
                      className="text-muted"
                    />
                    <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Details for this title will be added soon.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-foreground text-background">
        <div className="container-px py-20 text-center sm:py-28">
          <Reveal>
            <h2 className="mx-auto max-w-xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
              Want to be notified when new titles release?
            </h2>
            <Link
              href="/contact"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
            >
              Get in Touch
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
