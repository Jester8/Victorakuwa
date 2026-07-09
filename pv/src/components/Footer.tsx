import Link from "next/link";
import { InstagramIcon, YoutubeIcon, FacebookIcon } from "./SocialIcons";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/books", label: "Books" },
  { href: "/contact", label: "Contact" },
];

const socials = [
  { href: "#", label: "Instagram", icon: InstagramIcon },
  { href: "#", label: "YouTube", icon: YoutubeIcon },
  { href: "#", label: "Facebook", icon: FacebookIcon },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="container-px flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Pastor Victor Akuwa
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Raising people who know God deeply, live by His Word, and carry
            His influence into every sphere of society.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Menu
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Connect
            </p>
            <div className="mt-4 flex gap-3">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  <Icon size={16} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-px border-t border-line py-6">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} Pastor Victor Akuwa. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
