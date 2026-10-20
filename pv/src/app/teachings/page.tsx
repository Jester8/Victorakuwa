import Image from "next/image";
import { ArrowUpRight, Music2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { audioReleases, audioTeachings } from "@/data/teachings";

export const metadata = {
  title: "Teachings | Pastor Victor Akuwa",
  description:
    "Listen to audio teachings from The Prevailing House Global and explore audio releases from Pastor Victor Akuwa.",
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
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden border border-line bg-foreground/[0.03] md:ml-auto">
            <Image
              src="/photos/IMG_8141.webp"
              alt="Pastor Victor Akuwa reading and making notes at his desk."
              fill
              sizes="(min-width: 1024px) 38vw, (min-width: 768px) 42vw, 100vw"
              className="object-cover object-top"
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
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  {audioTeachings.channel}
                </h2>
                <p className="mt-3 max-w-xl leading-relaxed text-muted">
                  {audioTeachings.description}
                </p>
              </div>
              <a
                href={audioTeachings.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 text-sm font-semibold underline decoration-line underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Open in Telegram
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 overflow-hidden border border-line bg-background p-1 sm:mt-10 sm:p-2">
              <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Telegram channel preview
              </p>
              <iframe
                src="https://t.me/s/ThePrevailingHouse?embed=1"
                title="The Prevailing House Global Telegram preview"
                loading="lazy"
                className="h-[360px] w-full border-0 bg-background sm:h-[460px]"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <p className="px-3 pb-2 pt-3 text-sm text-muted">
                Open the channel in Telegram to browse the full audio feed.
              </p>
            </div>
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
