import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, BookOpen, Clock3, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import { listPublishedPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { plainText } from "@/lib/sanitize";
import { readingMinutes } from "@/lib/slug";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Reflections, teachings, and notes from Pastor Victor Akuwa on faith, the Word, and everyday discipleship.",
  path: "/blog",
});

function PostMeta({ date, content }: { date: Date | null; content: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted">
      {date && <time dateTime={date.toISOString()}>{formatDate(date)}</time>}
      <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {readingMinutes(plainText(content))} min read</span>
    </div>
  );
}

function CoverArt({ src, title, featured = false }: { src: string | null; title: string; featured?: boolean }) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-line ${featured ? "aspect-[16/10] rounded-2xl sm:rounded-[1.75rem]" : "aspect-[5/3] rounded-xl"}`}>
        <Image src={src} alt={title} fill sizes={featured ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" priority={featured} />
      </div>
    );
  }

  return (
    <div className={`relative isolate flex overflow-hidden bg-[#17151b] text-white ${featured ? "aspect-[16/10] rounded-2xl p-6 sm:rounded-[1.75rem] sm:p-9" : "aspect-[5/3] rounded-xl p-5"}`}>
      <div className="absolute -right-12 -top-16 -z-10 size-56 rounded-full border border-white/15" />
      <div className="absolute -right-2 -top-6 -z-10 size-36 rounded-full border border-white/20" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="mt-auto">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60"><Sparkles size={12} /> A note for the journey</span>
        <p className={`mt-3 max-w-md font-medium leading-tight tracking-tight ${featured ? "text-2xl sm:text-4xl" : "text-xl"}`}>{title}</p>
      </div>
    </div>
  );
}

// Three books lying flat, drawn in a light isometric view: each is a cover
// (top), a spine (front) and a page block (right end).
const STACK = [
  { x: 34, y: 132, w: 168, h: 26, cover: "#1c1a21", top: "#2c2933", band: "#c9a45c", tilt: 0 },
  { x: 50, y: 106, w: 146, h: 24, cover: "#5b4a7a", top: "#6f5d90", band: "#e7dcc6", tilt: -3 },
  { x: 40, y: 82, w: 136, h: 22, cover: "#e9e1d3", top: "#f4eee4", band: "#1c1a21", tilt: 2 },
] as const;
const DX = 20;
const DY = 13;

function BookStack() {
  return (
    <svg viewBox="0 0 240 180" className="mx-auto h-auto w-52 sm:w-60" role="img" aria-label="A stack of books">
      <defs>
        {/* Soft top-lit shading laid over each spine and cover. */}
        <linearGradient id="book-spine-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="book-cover-light" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.18" />
        </linearGradient>
        <filter id="book-shadow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="124" cy="164" rx="96" ry="9" fill="#000" opacity="0.12" filter="url(#book-shadow)" />
      {STACK.map((b, i) => {
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        return (
          <g key={i} transform={`rotate(${b.tilt} ${cx} ${cy})`}>
            {/* Cover */}
            <polygon points={`${b.x},${b.y} ${b.x + b.w},${b.y} ${b.x + b.w + DX},${b.y - DY} ${b.x + DX},${b.y - DY}`} fill={b.top} />
            <polygon points={`${b.x},${b.y} ${b.x + b.w},${b.y} ${b.x + b.w + DX},${b.y - DY} ${b.x + DX},${b.y - DY}`} fill="url(#book-cover-light)" />
            {/* Page block on the right end, with a hint of page lines */}
            <polygon
              points={`${b.x + b.w},${b.y} ${b.x + b.w + DX},${b.y - DY} ${b.x + b.w + DX},${b.y - DY + b.h} ${b.x + b.w},${b.y + b.h}`}
              fill="#f7f2e9"
              stroke={b.cover}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {[0.3, 0.5, 0.7].map((t) => (
              <line
                key={t}
                x1={b.x + b.w + 2}
                y1={b.y + b.h * t}
                x2={b.x + b.w + DX - 2}
                y2={b.y - DY + b.h * t}
                stroke="#d9cfbf"
                strokeWidth="1"
              />
            ))}
            {/* Spine */}
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={b.cover} />
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="url(#book-spine-light)" />
            <rect x={b.x + 14} y={b.y + 5} width="3" height={b.h - 10} rx="1" fill={b.band} opacity="0.9" />
            <rect x={b.x + 22} y={b.y + 5} width="3" height={b.h - 10} rx="1" fill={b.band} opacity="0.9" />
            <rect x={b.x + 38} y={b.y + b.h / 2 - 1.5} width={b.w * 0.42} height="3" rx="1.5" fill={b.band} opacity="0.55" />
          </g>
        );
      })}
      {/* Ribbon bookmark falling from the top book */}
      <path d="M150 92 L150 116 L155 111 L160 116 L160 92 Z" fill="#c9a45c" />
    </svg>
  );
}

export default async function BlogIndex() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="container-px relative overflow-hidden pb-12 pt-16 sm:pb-16 sm:pt-24 lg:pt-28">
        <div className="pointer-events-none absolute right-[8%] top-10 -z-10 size-48 rounded-full bg-foreground/[0.035] blur-3xl sm:size-72" />
        <Reveal>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <span className="h-px w-7 bg-foreground/50" /> The journal
          </p>
          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Words to live <span className="text-muted">and grow by.</span>
            </h1>
            <p className="max-w-sm text-base leading-7 text-muted sm:text-lg">
              Thoughtful reflections on faith, the Word, and following God in the everyday.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted">
            <BookOpen size={16} />
            <span>{posts.length} {posts.length === 1 ? "article" : "articles"} to explore</span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span>By Pastor Victor Akuwa</span>
          </div>
        </Reveal>
      </section>

      {!featured && (
        <section className="container-px pb-28 sm:pb-36">
          <Reveal className="mx-auto max-w-2xl rounded-3xl bg-foreground/[0.03] px-6 py-14 text-center sm:px-12 sm:py-20">
            <BookStack />
            <h2 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">A little something is being prepared.</h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted">The first article is on its way. Come back soon for new reflections and teachings.</p>
            <Link
              href="/books"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Read his books in the meantime <ArrowRight size={15} />
            </Link>
          </Reveal>
        </section>
      )}

      {featured && (
        <section className="container-px pb-14 sm:pb-20">
          <Reveal>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Start here</p>
              <span className="text-xs text-muted">Featured article</span>
            </div>
            <Link href={`/blog/${featured.slug}`} className="group grid gap-7 rounded-3xl border border-line bg-background p-3 transition-shadow duration-300 hover:shadow-[0_18px_60px_rgba(0,0,0,0.07)] sm:p-5 md:grid-cols-[1.12fr_0.88fr] md:items-center md:gap-10 lg:p-6">
              <CoverArt src={featured.coverUrl} title={featured.title} featured />
              <div className="px-3 pb-4 sm:px-4 md:px-2 md:py-6">
                <PostMeta date={featured.publishedAt} content={featured.contentHtml} />
                <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] transition-colors group-hover:text-muted sm:text-4xl lg:text-[2.75rem]">
                  {featured.title}
                </h2>
                {featured.excerpt && <p className="mt-4 line-clamp-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">{featured.excerpt}</p>}
                <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-[gap,opacity] group-hover:gap-3 group-hover:opacity-80">
                  Read the story <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <section className="container-px pb-24 sm:pb-32">
          <div className="mb-7 flex items-end justify-between border-b border-line pb-5 sm:mb-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Keep exploring</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">More from the journal</h2>
            </div>
            <ArrowDownRight size={22} className="mb-1 text-muted" />
          </div>
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12">
            {rest.map((post, i) => (
              <li key={post.id}>
                <Reveal delay={Math.min(i, 5) * 0.05}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <CoverArt src={post.coverUrl} title={post.title} />
                    <div className="pt-5">
                      <PostMeta date={post.publishedAt} content={post.contentHtml} />
                      <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-muted sm:text-2xl">{post.title}</h3>
                      {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted sm:text-base sm:leading-7">{post.excerpt}</p>}
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Read article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
