import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import AdminNav from "@/app/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin | Pastor Victor Akuwa",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    return <main className="flex min-h-screen flex-1 bg-neutral-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 md:flex-row">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-line md:bg-background">
        <Link href="/admin" className="flex items-center gap-3 px-6 py-7">
          <Image src="/audio/prevailing-house-channel.jpg" alt="" width={36} height={36} className="size-9 shrink-0 rounded-full border border-line object-cover" />
          <span>
            <span className="block text-sm font-semibold tracking-tight">Pastor Victor Akuwa</span>
            <span className="block text-xs text-muted">Admin</span>
          </span>
        </Link>
        <AdminNav variant="sidebar" />
        <div className="mt-auto space-y-1 border-t border-line p-3">
          <Link
            href="/admin/posts/new"
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-80"
          >
            <Plus size={16} /> New post
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <LogOut size={15} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="flex items-center justify-between gap-3 border-b border-line bg-background px-5 py-3 md:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <Image src="/audio/prevailing-house-channel.jpg" alt="" width={32} height={32} className="size-8 shrink-0 rounded-full border border-line object-cover" />
          <span className="truncate text-sm font-semibold tracking-tight">Admin</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/admin/posts/new"
            aria-label="New post"
            className="flex size-9 items-center justify-center rounded-full bg-foreground text-background"
          >
            <Plus size={18} />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-5 sm:pt-8 md:px-10 md:py-10">{children}</main>
      <AdminNav variant="tabs" />
    </div>
  );
}
