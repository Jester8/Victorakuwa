"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ExternalLink, FileText, MessageSquare, Palette } from "lucide-react";

const nav = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/theme", label: "Theme", icon: Palette },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Sidebar links on tablets and up; a fixed bottom tab bar on phones. */
export default function AdminNav({ variant }: { variant: "sidebar" | "tabs" }) {
  const pathname = usePathname();

  if (variant === "tabs") {
    return (
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {[...nav, { href: "/blog", label: "Blog", icon: ExternalLink }].map(({ href, label, icon: Icon }) => {
          const active = href !== "/blog" && isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              target={href === "/blog" ? "_blank" : undefined}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-foreground" : "text-muted"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  const linkClass = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1 px-3">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${linkClass} ${
              active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
      <Link
        href="/blog"
        target="_blank"
        className={`${linkClass} text-foreground/80 hover:bg-foreground/5 hover:text-foreground`}
      >
        <ExternalLink size={16} /> View blog
      </Link>
    </nav>
  );
}
