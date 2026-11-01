import Link from "next/link";
import { Eye, EyeOff, ExternalLink, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { plainText } from "@/lib/sanitize";
import { deletePostAction, setPostStatusAction } from "@/app/admin/actions";
import ConfirmButton from "@/app/admin/ConfirmButton";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

function listHref(filter: Filter, q: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

const iconButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-background px-3 text-sm font-medium transition-colors hover:border-foreground";

export default async function AdminPosts({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filter: Filter = params.status === "published" || params.status === "draft" ? params.status : "all";
  const q = (params.q ?? "").trim().slice(0, 100);

  const all = await listAllPosts();
  const counts = {
    all: all.length,
    published: all.filter((p) => p.status === "published").length,
    draft: all.filter((p) => p.status === "draft").length,
  };
  const needle = q.toLowerCase();
  const posts = all.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      (!needle || p.title.toLowerCase().includes(needle) || p.slug.includes(needle) || p.excerpt.toLowerCase().includes(needle))
  );
  const back = listHref(filter, q);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Posts</h1>
          <p className="mt-1 text-sm text-muted sm:text-base">
            {counts.published} live &middot; {counts.draft} {counts.draft === 1 ? "draft" : "drafts"}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          <Plus size={16} /> New post
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filter posts" className="flex w-full rounded-full border border-line bg-background p-1 text-sm sm:w-auto">
          {FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={listHref(value, q)}
              aria-current={filter === value ? "page" : undefined}
              className={`flex-1 rounded-full px-4 py-1.5 text-center font-medium transition-colors sm:flex-none ${
                filter === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              }`}
            >
              {label} <span className="tabular-nums opacity-70">{counts[value]}</span>
            </Link>
          ))}
        </nav>
        <form action="/admin/posts" className="relative w-full sm:w-72">
          {filter !== "all" && <input type="hidden" name="status" value={filter} />}
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search posts"
            aria-label="Search posts"
            className="h-10 w-full rounded-full border border-line bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-foreground"
          />
        </form>
      </div>

      {all.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-background p-10 text-center">
          <p className="font-semibold">No posts yet</p>
          <p className="mt-1 text-sm text-muted">Write the first one and publish it when it&rsquo;s ready.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-background p-10 text-center">
          <p className="font-semibold">No posts match</p>
          <p className="mt-1 text-sm text-muted">
            <Link href={listHref("all", "")} className="underline underline-offset-2">
              Clear the filters
            </Link>{" "}
            to see every post.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-background">
          {posts.map((post) => {
            const isLive = post.status === "published";
            // An empty draft has to be written in the editor before it can go live.
            const canToggle = isLive || Boolean(post.title.trim() && plainText(post.contentHtml));
            return (
              <li key={post.id} className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
                <Link href={`/admin/posts/${post.id}`} className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-foreground/[0.05] sm:w-24">
                    {post.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <FileText size={20} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold leading-snug hover:underline">
                      {post.title || "Untitled"}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                          isLive ? "bg-foreground text-background" : "border border-line text-muted"
                        }`}
                      >
                        {isLive ? "Live" : "Draft"}
                      </span>
                      {isLive && post.publishedAt
                        ? `Published ${formatDate(post.publishedAt)}`
                        : `Edited ${formatDate(post.updatedAt)}`}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted tabular-nums">
                      <span>{post.views} views</span>
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                      <span>{post.shares} shares</span>
                    </span>
                  </span>
                </Link>

                <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
                  <Link href={`/admin/posts/${post.id}`} className={iconButton}>
                    <Pencil size={14} /> Edit
                  </Link>
                  {isLive && (
                    <Link href={`/blog/${post.slug}`} target="_blank" className={iconButton} aria-label={`View ${post.title}`}>
                      <ExternalLink size={14} /> <span className="hidden sm:inline">View</span>
                    </Link>
                  )}
                  {canToggle && (
                    <form action={setPostStatusAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value={isLive ? "draft" : "published"} />
                      <button type="submit" className={iconButton}>
                        {isLive ? <EyeOff size={14} /> : <Eye size={14} />}
                        {isLive ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                  )}
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="back" value={back} />
                    <ConfirmButton
                      message={`Delete "${post.title || "Untitled"}", its comments and its stats for good?`}
                      className="inline-flex size-9 items-center justify-center rounded-full text-red-700 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={15} aria-label="Delete post" />
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
