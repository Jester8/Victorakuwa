import { headers } from "next/headers";
import { recordPageView } from "@/lib/blog";
import { describeUserAgent, isBot } from "@/lib/ua";
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

  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  if (isBot(ua)) return new Response(null, { status: 204 });
  // Vercel adds the visitor's country; elsewhere it's simply left blank.
  const country = h.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;

  await recordPageView(path, visitorId, referrer, { ...describeUserAgent(ua), country });
  return new Response(null, { status: 204 });
}
