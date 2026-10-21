import { addComment, getPublishedPostId, listComments, recentCommentCount } from "@/lib/blog";
import { COMMENT_BODY_MAX, COMMENT_NAME_MAX } from "@/lib/reactions";
import { getVisitorId } from "@/lib/visitor";

type Context = { params: Promise<{ slug: string }> };

const GIF_URL = /^https:\/\/media\d*\.giphy\.com\/[\w./?=&%-]+$/;

export async function GET(_request: Request, { params }: Context) {
  const postId = await getPublishedPostId((await params).slug);
  if (!postId) return Response.json({ error: "Post not found" }, { status: 404 });
  return Response.json({ comments: await listComments(postId, await getVisitorId()) });
}

export async function POST(request: Request, { params }: Context) {
  const visitorId = await getVisitorId();
  if (!visitorId) {
    return Response.json({ error: "Please enable cookies to comment." }, { status: 400 });
  }
  const postId = await getPublishedPostId((await params).slug);
  if (!postId) return Response.json({ error: "Post not found" }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  // Bots fill every field; people never see this one.
  if (body?.website) return Response.json({ ok: true });

  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  const gifUrl = typeof body?.gifUrl === "string" && GIF_URL.test(body.gifUrl) ? body.gifUrl : null;

  if (name.length < 2 || name.length > COMMENT_NAME_MAX) {
    return Response.json({ error: "Please add your name." }, { status: 400 });
  }
  if (!text && !gifUrl) {
    return Response.json({ error: "Write something or pick a GIF." }, { status: 400 });
  }
  if (text.length > COMMENT_BODY_MAX) {
    return Response.json(
      { error: `Comments can be up to ${COMMENT_BODY_MAX} characters.` },
      { status: 400 }
    );
  }
  if ((await recentCommentCount(visitorId, 10)) >= 5) {
    return Response.json(
      { error: "You're commenting very quickly. Please wait a few minutes." },
      { status: 429 }
    );
  }

  await addComment({ postId, visitorId, name, body: text, gifUrl });
  return Response.json({ comments: await listComments(postId, visitorId) });
}
