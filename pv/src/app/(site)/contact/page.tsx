import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";
import ContactForm from "@/components/ContactForm";
import { InstagramIcon } from "@/components/SocialIcons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with Pastor Victor Akuwa for ministry invitations, mentorship, book enquiries, and connecting with The Prevailing House.",
  path: "/contact",
});

const officialLinksUrl = "https://linktr.ee/vakuwa";
const instagramUrl = "https://www.instagram.com/akuwavictor";

export default function Contact() {
  return (
    <>
      <section className="relative flex h-[72svh] min-h-[480px] max-h-[720px] w-full items-end overflow-hidden">
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
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-transform hover:-translate-y-0.5"
            >
              Explore PV&rsquo;s links
              <ArrowUpRight size={16} />
            </a>
          </TypewriterHeading>
        </div>
      </section>

      <section className="container-px grid gap-12 py-16 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16 lg:py-24">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Get in touch
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Send a message.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted">
            For enquiries, speaking invitations, or a simple hello, leave a
            message here or find PV through his official links.
          </p>
          <a
            href={officialLinksUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-line underline-offset-4"
          >
            Official links
            <ArrowUpRight size={15} />
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pastor Victor Akuwa on Instagram, @akuwavictor"
            className="group mt-10 flex items-center gap-4 border-t border-line pt-6"
          >
            <InstagramIcon size={22} />
            <div>
              <p className="text-sm font-semibold">Instagram</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted transition-colors group-hover:text-foreground">
                @akuwavictor
                <ArrowUpRight size={14} />
              </p>
            </div>
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
