"use client";

import { useState } from "react";
import { POST_REACTIONS, type ReactionSummary } from "@/lib/reactions";

export function toggleLocal(summary: ReactionSummary, emoji: string): ReactionSummary {
  const mine = summary.mine.includes(emoji);
  const count = (summary.counts[emoji] ?? 0) + (mine ? -1 : 1);
  return {
    counts: { ...summary.counts, [emoji]: Math.max(0, count) },
    mine: mine ? summary.mine.filter((e) => e !== emoji) : [...summary.mine, emoji],
  };
}

export default function PostReactions({
  slug,
  initial,
}: {
  slug: string;
  initial: ReactionSummary;
}) {
  const [summary, setSummary] = useState(initial);

  const react = async (emoji: string) => {
    const previous = summary;
    setSummary(toggleLocal(summary, emoji));
    try {
      const res = await fetch(`/api/blog/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error();
      setSummary(await res.json());
    } catch {
      setSummary(previous);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold">Did this bless you?</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="React to this post">
        {POST_REACTIONS.map((emoji) => {
          const active = summary.mine.includes(emoji);
          const count = summary.counts[emoji] ?? 0;
          return (
            <button
              key={emoji}
              type="button"
              aria-pressed={active}
              aria-label={`React with ${emoji}${count ? `, ${count} so far` : ""}`}
              onClick={() => react(emoji)}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-all active:scale-95 ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-background hover:border-foreground"
              }`}
            >
              <span className="text-lg leading-none">{emoji}</span>
              {count > 0 && <span className="font-semibold tabular-nums">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
