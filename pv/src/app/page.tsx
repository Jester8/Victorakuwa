import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, HeartHandshake, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";

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
      <section className="relative flex h-[92vh] min-h-[640px] w-full items-end overflow-hidden">
        <Image
          src="/pv3.jpeg"
          alt="Pastor Victor Akuwa"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

        <div className="container-px relative w-full pb-16 sm:pb-24">
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
        </div>
      </section>

      {/* Mission statement */}
      <section className="mt-12 bg-foreground py-20 text-background sm:mt-20 sm:py-28">
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
          <Reveal className="w-full md:w-2/5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-foreground/5 md:max-w-xs">
              <Image
                src="/pv2.jpeg"
                alt="Pastor Victor Akuwa teaching"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-contain"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="w-full md:w-3/5">
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
      <section className="border-y border-line bg-foreground/[0.02] py-20 sm:py-28">
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
                <div className="h-full rounded-2xl border border-line bg-background p-7 transition-colors hover:border-foreground">
                  <Icon size={26} strokeWidth={1.5} />
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
      <section className="container-px py-20 sm:py-28">
        <div className="flex flex-col items-center gap-12 md:flex-row-reverse md:gap-16">
          <Reveal className="w-full md:w-2/5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-foreground/5 md:max-w-xs">
              <Image
                src="/pv4.jpeg"
                alt="Pastor Victor Akuwa, author"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-contain"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="w-full md:w-3/5">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Books
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Biblical truth made simple, practical, and accessible.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              As the author of several books, PV helps believers develop
              strong Christian foundations and mature in their walk with
              God.
            </p>
            <Link
              href="/books"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              Explore his books
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        <Image
          src="/pv3.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-foreground/80" />
        <div className="container-px relative text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-background sm:text-4xl">
              Whether through teaching, writing, or mentoring, PV remains
              committed to one mission.
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
