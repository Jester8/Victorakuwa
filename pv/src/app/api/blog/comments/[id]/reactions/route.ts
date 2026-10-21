import { toggleCommentReaction } from "@/lib/blog";
import { getVisitorId } from "@/lib/visitor";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const visitorId = await getVisitorId();
  if (!visitorId) return Response.json({ error: "Enable cookies to react." }, { status: 400 });
  const commentId = Number((await params).id);
  const body = (await request.json().catch(() => null)) as { emoji?: unknown } | null;
  if (!Number.isInteger(commentId) || typeof body?.emoji !== "string") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const ok = await toggleCommentReaction(commentId, visitorId, body.emoji);
  return ok
    ? new Response(null, { status: 204 })
    : Response.json({ error: "Comment not found" }, { status: 404 });
}
