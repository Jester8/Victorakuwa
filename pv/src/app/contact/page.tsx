import Image from "next/image";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/SocialIcons";
import Reveal from "@/components/Reveal";
import TypewriterHeading from "@/components/TypewriterHeading";

export const metadata = {
  title: "Contact | Pastor Victor Akuwa",
  description: "Connect with Pastor Victor Akuwa.",
};

const socials = [
  { href: "#", label: "Instagram", icon: InstagramIcon },
  { href: "#", label: "YouTube", icon: YoutubeIcon },
  { href: "#", label: "Facebook", icon: FacebookIcon },
];

export default function Contact() {
  return (
    <section className="relative flex h-[85vh] min-h-[560px] w-full items-end overflow-hidden">
      <Image
        src="/pv2.jpeg"
        alt="Pastor Victor Akuwa"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

      <div className="container-px relative w-full pb-16 sm:pb-24">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Contact
          </p>
        </Reveal>
        <TypewriterHeading
          text="Let’s connect."
          className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
        >
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            Follow along with PV&rsquo;s teaching and ministry as Lead
            Pastor of The Prevailing House and Resident Pastor of Davidic
            Generation Church, across the platforms below.
          </p>

          <div className="mt-10 flex gap-4">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white text-white transition-colors hover:bg-white hover:text-foreground"
              >
                <Icon size={22} strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </TypewriterHeading>
      </div>
    </section>
  );
}
