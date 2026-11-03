"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const INTERVAL = 20_000;

/** Re-fetches the dashboard every 20 seconds while the tab is open, so the numbers stay live. */
export default function LiveRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [updated, setUpdated] = useState(() => new Date());

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      startTransition(() => router.refresh());
      setUpdated(new Date());
    };
    const id = setInterval(tick, INTERVAL);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router]);

  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted" aria-live="polite" suppressHydrationWarning>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#1baf7a] opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-[#1baf7a]" />
      </span>
      {pending
        ? "Updating…"
        : `Live · updated ${updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
    </span>
  );
}
