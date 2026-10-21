import { recordPageView } from "@/lib/blog";
import { getVisitorId } from "@/lib/visitor";

export async function POST(request: Request) {
  const visitorId = await getVisitorId();
  if (!visitorId) return new Response(null, { status: 204 });

  const body = (await request.json().catch(() => null)) as
    | { path?: unknown; referrer?: unknown }
    | null;
  const path = typeof body?.path === "string" ? body.path.slice(0, 300) : "";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }
  const referrer =
    typeof body?.referrer === "string" && /^https?:\/\//.test(body.referrer)
      ? body.referrer.slice(0, 300)
      : null;

  await recordPageView(path, visitorId, referrer);
  return new Response(null, { status: 204 });
}
