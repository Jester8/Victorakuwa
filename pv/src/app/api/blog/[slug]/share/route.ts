import { getPublishedPostId, recordShare } from "@/lib/blog";
import { SHARE_NETWORKS } from "@/lib/reactions";
import { getVisitorId } from "@/lib/visitor";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Context) {
  const visitorId = await getVisitorId();
  const postId = await getPublishedPostId((await params).slug);
  const body = (await request.json().catch(() => null)) as { network?: unknown } | null;
  const network = body?.network;

  if (
    visitorId &&
    postId &&
    typeof network === "string" &&
    (SHARE_NETWORKS as readonly string[]).includes(network)
  ) {
    await recordShare(postId, visitorId, network);
  }
  return new Response(null, { status: 204 });
}
