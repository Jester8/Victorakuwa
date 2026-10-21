"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Records one page view per route change for the admin dashboard. */
export default function PageViewTracker() {
  const pathname = usePathname();
  const firstView = useRef(true);

  useEffect(() => {
    let referrer: string | null = null;
    if (firstView.current) {
      firstView.current = false;
      // Only external referrers are useful; in-site navigation isn't a traffic source.
      if (document.referrer && !document.referrer.startsWith(location.origin)) {
        referrer = document.referrer;
      }
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
