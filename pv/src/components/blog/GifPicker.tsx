"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export type Gif = { id: string; title: string; url: string; preview: string; width: number; height: number };

export default function GifPicker({ onPick }: { onPick: (gif: Gif) => void }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/gifs?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await res.json()) as { gifs: Gif[]; error?: string };
        setGifs(data.gifs);
        setError(data.error ?? "");
        setStatus(res.ok ? "ready" : "error");
      } catch {
        if (!controller.signal.aborted) {
          setError("Couldn't load GIFs.");
          setStatus("error");
        }
      }
    }, query ? 350 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div role="dialog" aria-label="Pick a GIF" className="w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-background p-3 shadow-lg">
      <label className="flex items-center gap-2 rounded-full border border-line px-3 focus-within:border-foreground">
        <Search size={15} className="text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs"
          aria-label="Search GIFs"
          className="h-10 w-full bg-transparent text-sm outline-none"
        />
      </label>
      <div className="mt-3 h-72 overflow-y-auto overscroll-contain" data-lenis-prevent>
        {status === "error" ? (
          <p className="p-4 text-center text-sm text-muted">{error || "Couldn't load GIFs."}</p>
        ) : status === "loading" && gifs.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted">Loading…</p>
        ) : gifs.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted">No GIFs found.</p>
        ) : (
          <div className="columns-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onPick(gif)}
                className="mb-2 block w-full overflow-hidden rounded-lg bg-line focus-visible:outline-2 focus-visible:outline-foreground"
                aria-label={gif.title || "GIF"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gif.preview} alt="" width={gif.width} height={gif.height} loading="lazy" className="h-auto w-full" />
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-right text-[10px] uppercase tracking-widest text-muted">Powered by GIPHY</p>
    </div>
  );
}
