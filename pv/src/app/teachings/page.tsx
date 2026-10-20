import Image from "next/image";
import { ArrowUpRight, Music2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import TeachingsVideoGrid from "@/components/TeachingsVideoGrid";
import { audioReleases, audioTeachings } from "@/data/teachings";

const dgcWebsiteUrl = "https://www.davidicgenerationchurch.com/";

export const metadata = {
  title: "Teachings | Pastor Victor Akuwa",
  description:
    "Watch selected messages from Pastor Victor Akuwa’s teaching ministry at Davidic Generation Church Ibadan, and explore his audio releases.",
};

export default function Teachings() {
  return (
    <>
      <section className="container-px grid items-center gap-10 py-16 sm:py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:py-28">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Listen &amp; grow
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Teachings and audio from Pastor Victor Akuwa.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Find audio teachings from The Prevailing House Global, alongside
            two audio releases from PV.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden border border-line bg-foreground/[0.03] md:ml-auto">
            <Image
              src="/photos/IMG_8141.webp"
              alt="Pastor Victor Akuwa reading and making notes at his desk."
              fill
              sizes="(min-width: 1024px) 38vw, (min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="border-y border-line bg-background py-16 sm:py-20 lg:py-24">
        <div className="container-px">
          <Reveal>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted">
                  Audio teachings
                </p>
                <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  {audioTeachings.channel}
                </h2>
                <p className="mt-3 max-w-xl leading-relaxed text-muted">
                  {audioTeachings.description}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 flex flex-col gap-5 border border-line bg-background p-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Telegram channel
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight">
                  Browse the latest teachings from {audioTeachings.channel}.
                </p>
              </div>
              <a
                href={audioTeachings.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
              >
                Open in Telegram
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-background py-16 sm:py-20 lg:py-24">
        <div className="container-px">
          <Reveal>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Teachings from Davidic Generation Church Ibadan.
                </h2>
                <p className="mt-3 max-w-xl leading-relaxed text-muted">
                  These messages share what Pastor Victor Akuwa teaches as
                  Resident Pastor at Davidic Generation Church Ibadan. Search
                  by title or choose a series, then select a message to watch
                  it in a popup.
                </p>
              </div>
              <a
                href={dgcWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 text-sm font-semibold underline decoration-line underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Visit Davidic Generation Church
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <TeachingsVideoGrid />
          </Reveal>
        </div>
      </section>

      <section className="container-px py-16 sm:py-20 lg:py-24">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Audio releases
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            More to listen to.
          </h2>
        </Reveal>

        <div className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2">
          {audioReleases.map(({ title, href, cover }, index) => (
            <Reveal key={title} delay={index * 0.07}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-36 items-center gap-5 border border-line bg-background p-4 transition-transform duration-300 hover:-translate-y-1 sm:gap-7 sm:p-6"
              >
                <div className="relative aspect-square w-28 shrink-0 overflow-hidden border border-line bg-foreground/[0.03] sm:w-36">
                  <Image
                    src={cover}
                    alt={`${title} audio release cover`}
                    fill
                    sizes="(min-width: 640px) 144px, 112px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    <Music2 size={15} strokeWidth={1.5} />
                    Audio release
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                    {title}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    Listen now
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
