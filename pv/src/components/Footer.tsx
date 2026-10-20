import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/books", label: "Books" },
  { href: "/teachings", label: "Teachings" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-foreground bg-foreground text-background">
      <div className="container-px flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-lg font-semibold tracking-tight text-background">
            Pastor Victor Akuwa
          </p>
          <p className="mt-3 text-sm leading-relaxed text-background/65">
            Raising people who know God deeply, live by His Word, and carry
            His influence into every sphere of society.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-background/60">
              Menu
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/75 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-background/60">
              Links
            </p>
            <a
              href="https://linktr.ee/vakuwa"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-background/75 transition-colors hover:text-background"
            >
              Official links
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>

      <div className="container-px border-t border-background/20 py-6">
        <p className="text-xs text-background/60">
          &copy; {new Date().getFullYear()} Pastor Victor Akuwa. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
