import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";
import { InstagramIcon } from "@/components/SocialIcons";

export const metadata = {
  title: "Contact | Pastor Victor Akuwa",
  description: "Connect with Pastor Victor Akuwa.",
};

const officialLinksUrl = "https://linktr.ee/vakuwa";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

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
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
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

          <div className="mt-10 flex items-center gap-4 border-t border-line pt-6">
            <InstagramIcon size={22} />
            <div>
              <p className="text-sm font-semibold">Instagram</p>
              <p className="mt-1 text-sm text-muted">Profile link coming soon</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <form
            action={
              contactEmail
                ? `mailto:${contactEmail}?subject=Website%20contact%20message`
                : undefined
            }
            method="post"
            encType="text/plain"
            className="space-y-5 border border-line bg-background p-6 sm:p-8"
          >
            <fieldset disabled={!contactEmail} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Name
                  <input
                    name="Name"
                    type="text"
                    autoComplete="name"
                    required
                    className="mt-2 min-h-12 w-full border border-line bg-background px-4 font-normal outline-none transition-colors placeholder:text-muted focus:border-foreground"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Email
                  <input
                    name="Email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 min-h-12 w-full border border-line bg-background px-4 font-normal outline-none transition-colors placeholder:text-muted focus:border-foreground"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Subject
                <input
                  name="Subject"
                  type="text"
                  required
                  className="mt-2 min-h-12 w-full border border-line bg-background px-4 font-normal outline-none transition-colors placeholder:text-muted focus:border-foreground"
                  placeholder="What would you like to discuss?"
                />
              </label>
              <label className="block text-sm font-semibold">
                Message
                <textarea
                  name="Message"
                  rows={5}
                  required
                  className="mt-2 w-full resize-y border border-line bg-background px-4 py-3 font-normal outline-none transition-colors placeholder:text-muted focus:border-foreground"
                  placeholder="Write your message here..."
                />
              </label>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send message
                <ArrowUpRight size={16} />
              </button>
            </fieldset>
            {!contactEmail && (
              <p className="text-sm text-muted">
                Share the contact email address to enable message delivery.
              </p>
            )}
          </form>
        </Reveal>
      </section>
    </>
  );
}
