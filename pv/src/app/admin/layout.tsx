import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, FileText, LogOut, MessageSquare, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin | Pastor Victor Akuwa",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    return <main className="flex min-h-screen flex-1 bg-neutral-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 md:flex-row">
      <aside className="border-b border-line bg-background md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:block md:px-6 md:py-7">
          <Link href="/admin" className="block">
            <p className="text-sm font-semibold tracking-tight">Pastor Victor Akuwa</p>
            <p className="text-xs text-muted">Admin</p>
          </Link>
          <form action={logoutAction} className="md:hidden">
            <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-muted">
              <LogOut size={15} /> Sign out
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <ExternalLink size={16} /> View blog
          </Link>
        </nav>
        <form action={logoutAction} className="absolute bottom-6 hidden px-6 md:block">
          <button type="submit" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
            <LogOut size={15} /> Sign out
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
