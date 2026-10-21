import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export default async function AdminPosts() {
  await requireAdmin();
  const posts = await listAllPosts();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-muted">{posts.length} {posts.length === 1 ? "post" : "posts"}</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          <Plus size={16} /> New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-background p-10 text-center">
          <p className="font-semibold">No posts yet</p>
          <p className="mt-1 text-sm text-muted">Write the first one and publish it when it&rsquo;s ready.</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-background">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="flex flex-col gap-2 p-5 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        post.status === "published"
                          ? "bg-foreground text-background"
                          : "border border-line text-muted"
                      }`}
                    >
                      {post.status === "published" ? "Live" : "Draft"}
                    </span>
                    <p className="truncate font-semibold">{post.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {post.status === "published" && post.publishedAt
                      ? `Published ${formatDate(post.publishedAt)}`
                      : `Edited ${formatDate(post.updatedAt)}`}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-muted tabular-nums">
                  {post.views} views &middot; {post.likes} likes &middot; {post.comments} comments &middot; {post.shares} shares
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
