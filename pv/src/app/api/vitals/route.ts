import { headers } from "next/headers";
import { recordWebVital } from "@/lib/analytics";
import { describeUserAgent, isBot } from "@/lib/ua";

const METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

/** Page-speed measurements from real visitors' browsers (see WebVitalsReporter). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; value?: unknown; path?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name : "";
  const value = typeof body?.value === "number" ? body.value : NaN;
  const path = typeof body?.path === "string" ? body.path.slice(0, 300) : "";
  if (!METRICS.has(name) || !Number.isFinite(value) || value < 0 || value > 600_000 || !path.startsWith("/")) {
    return new Response(null, { status: 204 });
  }
  if (path.startsWith("/admin") || path.startsWith("/api")) return new Response(null, { status: 204 });

  const ua = (await headers()).get("user-agent") ?? "";
  if (isBot(ua)) return new Response(null, { status: 204 });

  await recordWebVital(path, name, value, describeUserAgent(ua).device);
  return new Response(null, { status: 204 });
}
