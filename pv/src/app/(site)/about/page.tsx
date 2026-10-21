import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";

export const metadata = {
  title: "About | Pastor Victor Akuwa",
  description:
    "Teacher, author, mentor, husband, father, and disciple committed to making disciples.",
};

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[88svh] min-h-[520px] max-h-[820px] w-full items-end overflow-hidden">
        <Image
          src="/photos/IMG_8143.webp"
          alt="Pastor Victor Akuwa standing beside his desk."
          fill
          priority
          sizes="100vw"
          className="object-cover object-top grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

        <div className="container-px relative w-full pb-16 sm:pb-24">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              About PV
            </p>
          </Reveal>
          <TypewriterHeading
            text="A life devoted to making disciples."
            className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
          >
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              PV is a teacher, author, mentor, husband, father, and a
              disciple committed to making disciples. Everything about his
              life points back to one singular calling.
            </p>
          </TypewriterHeading>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-line bg-background py-16 sm:py-20">
        <div className="container-px">
          <Reveal className="mx-auto max-w-5xl rounded-2xl border border-line bg-background px-7 py-10 shadow-sm sm:px-12 sm:py-14">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
              The mission
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-center text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
              Raising people who know God deeply, live by His Word, and
              carry His influence into every sphere of society, a conviction
              that has shaped not only his ministry, but also the way he has
              chosen to live.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Early life & education */}
      <section className="container-px py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Early Life
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Agbowo, Ibadan
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Raised in Agbowo, Ibadan, as the third of five children in the
              Akuwa family, PV&rsquo;s journey has been shaped by an
              unwavering commitment to growth, learning, love for people,
              and the call of God.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Education
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Psychology &amp; beyond
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              That same commitment to understanding humanity led him to
              study Psychology at the University of Ibadan before earning
              two Master&rsquo;s degrees in Information Science and Human
              Resource Management.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Ministry */}
      <section className="py-20 sm:py-28">
        <div className="container-px flex flex-col items-center gap-12 md:flex-row md:gap-16">
          <Reveal className="w-full md:w-2/5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-foreground/5 md:max-w-xs">
              <Image
                src="/photos/IMG_8135.webp"
                alt="Pastor Victor Akuwa writing in a notebook at his desk."
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="w-full md:w-3/5">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Ministry
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Establishing men firmly in Christ.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-muted">
              As the Lead Pastor of The Prevailing House and Resident Pastor
              of Davidic Generation Church, PV is devoted to discipling men
              and raising sons through sound teaching, solid doctrine, and
              practical kingdom principles.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              As the author of several books, PV has consistently made
              biblical truth simple, practical, and accessible, helping
              believers develop strong Christian foundations and mature in
              their walk with God.
            </p>
            <Link
              href="/books"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              See his books
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Family */}
      <section className="border-y border-foreground bg-foreground text-background">
        <div className="container-px py-20 text-center sm:py-28">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-background/60">
              Family
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              A devoted husband to Peace, and a loving father.
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-background/70">
              Beyond the pulpit, PV is a man who models the values he
              teaches. His life reflects a continuous pursuit of growth,
              excellence, and faithful service to God and people.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing */}
      <section className="container-px py-20 text-center sm:py-28">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
            Raising a generation of sons who know Christ deeply, stand
            firmly in truth, and influence every sphere of society for the
            Kingdom.
          </h2>
          <Link
            href="/contact"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            Get in Touch
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
