import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, HeartHandshake, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";
import HeroCarousel from "@/components/HeroCarousel";
import BookCarousel from "@/components/BookCarousel";
import { books, latestBooks } from "@/data/books";

const roles = [
  {
    icon: GraduationCap,
    title: "Lead Pastor",
    desc: "The Prevailing House",
  },
  {
    icon: Users,
    title: "Resident Pastor",
    desc: "Davidic Generation Church",
  },
  {
    icon: BookOpen,
    title: "Author",
    desc: "Making biblical truth simple, practical, and accessible",
  },
  {
    icon: HeartHandshake,
    title: "Mentor & Father",
    desc: "Discipling men and raising sons in the faith",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroCarousel>
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Teacher &middot; Author &middot; Mentor
          </p>
        </Reveal>
        <TypewriterHeading
          text="Raising sons who carry God’s influence into every sphere."
          className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
            Pastor Victor Akuwa is a teacher, author, mentor, husband,
            father, and a disciple committed to making disciples, devoted
            to seeing men firmly established in Christ.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
            >
              About PV
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-full border border-white px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-foreground"
            >
              Explore Books
            </Link>
          </div>
        </TypewriterHeading>
      </HeroCarousel>

      {/* Mission statement */}
      <section className="mt-12 overflow-hidden border-y border-foreground bg-foreground py-20 text-background sm:mt-20 sm:py-28">
        <div className="container-px">
          <Reveal>
            <p className="mx-auto max-w-3xl text-center text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-4xl">
              &ldquo;Everything about his life points back to one singular
              calling: raising people who know God deeply, live by His Word,
              and carry His influence into every sphere of society.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>

      {/* About preview */}
      <section className="container-px py-20 sm:py-28">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          <Reveal className="order-2 w-full md:order-1 md:w-2/5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-background shadow-sm md:max-w-xs">
              <div className="relative h-full overflow-hidden">
                <Image
                  src="/photos/IMG_8139.webp"
                  alt="Pastor Victor Akuwa seated at his desk."
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.035]"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 w-full md:order-2 md:w-3/5">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              About PV
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              A life shaped by growth, learning, and the call of God.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Raised in Agbowo, Ibadan, as the third of five children in the
              Akuwa family, PV studied Psychology at the University of
              Ibadan before earning two Master&rsquo;s degrees in
              Information Science and Human Resource Management. But beyond
              the academic accomplishments is a man with a singular burden:
              to see men firmly established in Christ.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              Read his full story
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Roles grid */}
      <section className="border-y border-line bg-background py-20 sm:py-28">
        <div className="container-px">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              What He Does
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Devoted to discipling men and raising sons.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-line bg-background p-7 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <Icon className="text-foreground" size={26} strokeWidth={1.5} />
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Books preview */}
      <section className="relative isolate overflow-hidden border-y border-line bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2"
        >
          {books.map((book, index) => (
            <div
              key={book.slug}
              className={`relative overflow-hidden ${
                index % 2 === 0 ? "sm:-translate-y-3" : "sm:translate-y-3"
              }`}
            >
              <Image
                src={book.cover}
                alt=""
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="scale-110 object-cover object-center opacity-70 blur-[1px]"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/50"
          aria-hidden="true"
        />

        <div className="container-px relative flex min-h-[32rem] items-center py-20 sm:min-h-[36rem] sm:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
              Books
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Biblical truth made simple, practical, and accessible.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
              As the author of several books, PV helps believers develop strong
              Christian foundations and mature in their walk with God.
            </p>
            <Link
              href="/books"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-transform hover:-translate-y-0.5"
            >
              Explore his books
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Latest releases */}
      <section className="overflow-hidden border-y border-line bg-background py-20 sm:py-28">
        <div className="container-px">
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-muted">
                  New releases
                </p>
                <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Two new books from PV.
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
                  Explore the latest titles and choose one to read or purchase.
                </p>
              </div>
              <Link
                href="/books"
                className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-foreground transition-colors hover:gap-3"
              >
                Browse all books
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <BookCarousel items={latestBooks} variant="featured" />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        <Image
          src="/photos/IMG_8146.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="container-px relative text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Whether through teaching, writing, or mentoring, PV remains
              committed to one mission.
            </h2>
            <Link
              href="/contact"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-950 transition-transform hover:-translate-y-0.5"
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
