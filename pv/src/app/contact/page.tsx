import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";

export const metadata = {
  title: "Contact | Pastor Victor Akuwa",
  description: "Connect with Pastor Victor Akuwa.",
};

const officialLinksUrl = "https://linktr.ee/vakuwa";

export default function Contact() {
  return (
    <section className="relative flex h-[88svh] min-h-[520px] max-h-[820px] w-full items-end overflow-hidden">
      <Image
        src="/photos/IMG_8138.webp"
        alt="Pastor Victor Akuwa reflecting at his desk."
        fill
        priority
        sizes="100vw"
        className="object-cover object-top grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

      <div className="container-px relative w-full pb-16 sm:pb-24">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
            Contact
          </p>
        </Reveal>
        <TypewriterHeading
          text="Let’s connect."
          className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
        >
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            Find PV&rsquo;s books and audio teachings through his official links
            page.
          </p>
          <a
            href={officialLinksUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            Explore PV&rsquo;s links
            <ArrowUpRight size={16} />
          </a>
        </TypewriterHeading>
      </div>
    </section>
  );
}
