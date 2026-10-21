import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/app/admin/login/LoginForm";

const bookCoverClass =
  "absolute flex aspect-[3/4.3] w-36 flex-col justify-between overflow-hidden rounded-sm p-4 text-white shadow-2xl ring-1 ring-black/10 sm:w-40";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-[calc(100vh-5rem)] w-full lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <section className="relative hidden min-h-[760px] overflow-hidden bg-[#171522] px-10 py-12 text-white lg:flex lg:flex-col xl:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(139,92,246,0.24),transparent_42%),radial-gradient(ellipse_at_85%_80%,rgba(180,83,9,0.16),transparent_40%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold">PV</span>
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
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            A collection of teachings and books created to deepen faith, inspire growth, and bring God’s Word into everyday life.
          </p>
        </div>

        <div className="relative z-10 mt-10 min-h-[330px] flex-1">
          <div className="absolute left-[8%] top-10 z-10 w-[52%] rotate-[-7deg] overflow-hidden rounded-md border border-white/15 bg-[#22222a] shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:rotate-[-4deg]">
            <img
              src="https://files.selar.co/product-images/2023/products/victorakuwa/tribal-marks-selar.co-64a018fa319b3.jpg"
              alt="Tribal Marks by Victor Akuwa book promotion"
              className="aspect-square w-full object-cover"
            />
            <div className="border-t border-white/10 bg-[#22222a] px-4 py-3">
              <p className="text-sm font-semibold tracking-wide">TRIBAL MARKS</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">Victor Akuwa</p>
            </div>
          </div>

          <div className={`${bookCoverClass} right-[8%] top-0 rotate-[9deg] bg-gradient-to-br from-[#1b6b65] via-[#14524f] to-[#0a302f]`}>
            <span className="text-[9px] uppercase tracking-[0.24em] text-white/65">Healing · Wholeness</span>
            <span className="text-2xl font-semibold leading-tight">JEHOVAH<br />RAPHA</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/65">Victor Akuwa</span>
          </div>

          <div className={`${bookCoverClass} bottom-1 left-[16%] rotate-[7deg] bg-gradient-to-br from-[#d5ad68] via-[#a66f35] to-[#5a351f] text-[#fffaf0]`}>
            <span className="text-[9px] uppercase tracking-[0.22em] text-white/75">A life of faith</span>
            <span className="text-[22px] font-semibold leading-tight">WISDOM<br />THROUGH<br />FAITH</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/75">Victor Akuwa</span>
          </div>

          <div className={`${bookCoverClass} bottom-0 right-[9%] rotate-[-7deg] bg-gradient-to-br from-[#6741a5] via-[#3f286f] to-[#21153f]`}>
            <span className="text-[9px] uppercase tracking-[0.22em] text-white/65">Living by the God-kind of</span>
            <span className="text-3xl font-semibold leading-none">FAITH</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/65">Victor Akuwa</span>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
          <span>Books &amp; reflections by Pastor Victor Akuwa</span>
          <span>Faith · Knowledge · Purpose</span>
        </div>
      </section>

      <section className="flex min-h-[620px] items-center justify-center px-5 py-16 sm:px-10 lg:min-h-[760px] lg:px-12 xl:px-20">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">PV</span>
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
