import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { books } from "@/data/books";
import LoginForm from "@/app/admin/login/LoginForm";

// Four staggered columns of PV's real covers, repeated so the tilted wall
// always overfills the panel whatever its height.
const columns = [0, 3, 5, 2].map((offset) =>
  Array.from({ length: 6 }, (_, i) => books[(offset + i) % books.length])
);

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-screen w-full lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <section className="relative hidden min-h-[760px] overflow-hidden bg-[#171522] px-10 py-12 text-white lg:flex lg:flex-col xl:px-16">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -inset-x-[20%] -inset-y-[30%] flex rotate-[-10deg] justify-center gap-5 opacity-80">
            {columns.map((column, c) => (
              <div key={c} className={`flex w-44 shrink-0 flex-col gap-5 xl:w-52 ${c % 2 ? "translate-y-24" : ""}`}>
                {column.map((book, i) => (
                  <Image
                    key={`${book.slug}-${i}`}
                    src={book.cover}
                    alt=""
                    width={208}
                    height={300}
                    sizes="208px"
                    loading="eager"
                    className="h-auto w-full rounded-sm shadow-2xl ring-1 ring-white/10"
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Darken behind the copy and the footer so the text stays readable over the covers. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,21,34,0.97)_0%,rgba(23,21,34,0.85)_35%,rgba(23,21,34,0.25)_65%,rgba(23,21,34,0.85)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(139,92,246,0.22),transparent_45%)]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Image src="/audio/prevailing-house-channel.jpg" alt="" width={40} height={40} className="size-10 shrink-0 rounded-full border border-white/20 object-cover" />
          <div>
            <p className="text-sm font-semibold tracking-wide">Pastor Victor Akuwa</p>
            <p className="text-xs text-white/55">Author · Teacher · Pastor</p>
          </div>
        </div>

        <div className="relative z-10 mt-14 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">Words that build faith</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Truth to read.
            <br />
            Wisdom to live.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            A collection of teachings and books created to deepen faith, inspire growth, and bring God’s Word into everyday life.
          </p>
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/55">
          <span>{books.length} books by Pastor Victor Akuwa</span>
          <span>Faith · Knowledge · Purpose</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:min-h-[760px] lg:px-12 xl:px-20">
        <div className="w-full max-w-sm">
          <div aria-hidden="true" className="mb-8 flex justify-center lg:hidden">
            {books.slice(0, 5).map((book, i) => (
              <Image
                key={book.slug}
                src={book.cover}
                alt=""
                width={72}
                height={104}
                sizes="72px"
                loading="eager"
                className={`-mx-2 h-26 w-auto rounded-sm shadow-lg ring-1 ring-black/10 ${
                  ["-rotate-12 translate-y-3", "-rotate-6 translate-y-1", "z-10 scale-110", "rotate-6 translate-y-1", "rotate-12 translate-y-3"][i]
                }`}
              />
            ))}
          </div>
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image src="/audio/prevailing-house-channel.jpg" alt="" width={40} height={40} className="size-10 shrink-0 rounded-full border border-line object-cover" />
            <div>
              <p className="text-sm font-semibold">Pastor Victor Akuwa</p>
              <p className="text-xs text-muted">Admin portal</p>
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back, PV.</h1>
          <p className="mt-2 text-muted">Sign in to write posts and see how the blog is doing.</p>
          <LoginForm />
          <p className="mt-8 text-center text-xs leading-5 text-muted">
            Private access for managing posts and publishing updates.
          </p>
        </div>
      </section>
    </main>
  );
}
