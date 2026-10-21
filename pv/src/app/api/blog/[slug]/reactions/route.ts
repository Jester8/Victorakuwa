import { getPostReactions, getPublishedPostId, togglePostReaction } from "@/lib/blog";
import { getVisitorId } from "@/lib/visitor";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Context) {
  const postId = await getPublishedPostId((await params).slug);
  if (!postId) return Response.json({ error: "Post not found" }, { status: 404 });
  return Response.json(await getPostReactions(postId, await getVisitorId()));
}

export async function POST(request: Request, { params }: Context) {
  const visitorId = await getVisitorId();
  if (!visitorId) return Response.json({ error: "Enable cookies to react." }, { status: 400 });
  const postId = await getPublishedPostId((await params).slug);
  if (!postId) return Response.json({ error: "Post not found" }, { status: 404 });

  const body = (await request.json().catch(() => null)) as { emoji?: unknown } | null;
  if (typeof body?.emoji === "string") {
    await togglePostReaction(postId, visitorId, body.emoji);
  }
  return Response.json(await getPostReactions(postId, visitorId));
}
