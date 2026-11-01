import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllComments } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { deleteCommentAction, setCommentHiddenAction } from "@/app/admin/actions";
import ConfirmButton from "@/app/admin/ConfirmButton";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
] as const;

export default async function AdminComments({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  await requireAdmin();
  const show = (await searchParams).show;
  const filter = show === "visible" || show === "hidden" ? show : "all";
  const all = await listAllComments();
  const counts = {
    all: all.length,
    visible: all.filter((c) => !c.hidden).length,
    hidden: all.filter((c) => c.hidden).length,
  };
  const comments = all.filter((c) => filter === "all" || (filter === "hidden") === c.hidden);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Comments</h1>
      <p className="mt-1 text-sm text-muted sm:text-base">Hide a comment to remove it from the blog, or delete it for good.</p>

      <nav aria-label="Filter comments" className="mt-6 flex w-full rounded-full border border-line bg-background p-1 text-sm sm:w-auto sm:inline-flex">
        {FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/admin/comments" : `/admin/comments?show=${value}`}
            aria-current={filter === value ? "page" : undefined}
            className={`flex-1 rounded-full px-4 py-1.5 text-center font-medium transition-colors sm:flex-none ${
              filter === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"
            }`}
          >
            {label} <span className="tabular-nums opacity-70">{counts[value]}</span>
          </Link>
        ))}
      </nav>

      {comments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-background p-10 text-center text-muted">
          {all.length === 0 ? "No comments yet." : "No comments here."}
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-background">
          {comments.map((c) => (
            <li key={c.id} className={`p-4 sm:p-5 ${c.hidden ? "opacity-55" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-muted"> on </span>
                    <Link href={`/blog/${c.postSlug}`} target="_blank" className="font-medium underline decoration-line underline-offset-2">
                      {c.postTitle}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(c.createdAt)} &middot; {c.reactions} reactions
                    {c.hidden && " · Hidden"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={setCommentHiddenAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="hidden" value={String(!c.hidden)} />
                    <button type="submit" className="h-9 rounded-full border border-line px-4 text-sm font-medium hover:border-foreground">
                      {c.hidden ? "Show" : "Hide"}
                    </button>
                  </form>
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message="Delete this comment for good?" className="h-9 rounded-full px-4 text-sm font-medium text-red-700 hover:bg-red-50">
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>
              {c.body && <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">{c.body}</p>}
              {c.gifUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.gifUrl} alt="GIF" loading="lazy" className="mt-3 max-h-40 rounded-xl" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
