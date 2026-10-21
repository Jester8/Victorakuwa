import "server-only";
import { cookies } from "next/headers";

export const VISITOR_COOKIE = "pv_vid";

/** Anonymous first-party id set by the proxy; used to count unique visitors and dedupe reactions. */
export async function getVisitorId() {
  const value = (await cookies()).get(VISITOR_COOKIE)?.value;
  return value && /^[a-zA-Z0-9-]{8,64}$/.test(value) ? value : null;
}
