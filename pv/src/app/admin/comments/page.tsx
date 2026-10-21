import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllComments } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { deleteCommentAction, setCommentHiddenAction } from "@/app/admin/actions";
import ConfirmButton from "@/app/admin/ConfirmButton";

export default async function AdminComments() {
  await requireAdmin();
  const comments = await listAllComments();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Comments</h1>
      <p className="mt-1 text-muted">Hide a comment to remove it from the blog, or delete it for good.</p>

      {comments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-background p-10 text-center text-muted">
          No comments yet.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-background">
          {comments.map((c) => (
            <li key={c.id} className={`p-5 ${c.hidden ? "opacity-55" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">
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
                <div className="flex items-center gap-2">
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
