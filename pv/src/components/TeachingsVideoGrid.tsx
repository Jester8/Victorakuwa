"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { videoTeachings, type VideoTeaching } from "@/data/videoTeachings";

const seriesFilters = Array.from(
  new Set(
    videoTeachings.flatMap((video) => (video.series ? [video.series] : [])),
  ),
);

function formatSermonDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function TeachingsVideoGrid() {
  const [activeVideo, setActiveVideo] = useState<VideoTeaching | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [titleSearch, setTitleSearch] = useState("");

  const sortedVideos = [...videoTeachings].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const searchTerm = titleSearch.trim().toLowerCase();
  const visibleVideos = sortedVideos.filter((video) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "standalone"
        ? video.series === null
        : video.series === activeFilter);
    const matchesSearch =
      !searchTerm ||
      `${video.title} ${video.series ?? ""} ${video.speaker}`
        .toLowerCase()
        .includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: "all", label: "All messages" },
    ...seriesFilters.map((series) => ({ value: series, label: series })),
    { value: "standalone", label: "Standalone" },
  ];

  const filterCount = (value: string) => {
    if (value === "all") return videoTeachings.length;
    return videoTeachings.filter((video) =>
      value === "standalone" ? video.series === null : video.series === value,
    ).length;
  };

  useEffect(() => {
    if (!activeVideo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveVideo(null);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeVideo]);

  return (
    <>
      <div className="mt-8 border border-line p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              Browse the teachings
            </p>
            <p className="mt-1 text-sm text-muted">
              Search a title or select a series to see its messages.
            </p>
          </div>
          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Search sermon titles</span>
            <input
              type="search"
              value={titleSearch}
              onChange={(event) => setTitleSearch(event.target.value)}
              placeholder="Search sermon titles"
              className="min-h-11 w-full border border-line bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground"
            />
          </label>
        </div>

        <div
          role="group"
          aria-label="Filter teachings by series"
          className="mt-4 flex flex-wrap gap-2"
        >
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              aria-pressed={activeFilter === value}
              className={`inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm font-semibold transition-colors ${
                activeFilter === value
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-background text-foreground hover:border-foreground"
              }`}
            >
              {label}
              <span className="text-xs opacity-70">{filterCount(value)}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted" aria-live="polite">
          Showing {visibleVideos.length} of {videoTeachings.length} messages,
          newest first.
        </p>
      </div>

      {visibleVideos.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleVideos.map((video, index) => (
            <article
              key={video.id}
              className="overflow-hidden border border-line bg-background"
            >
              <button
                type="button"
                onClick={() => setActiveVideo(video)}
                aria-label={`Play ${video.title} by ${video.speaker}`}
                className="group block w-full text-left"
              >
                <div className="relative aspect-video overflow-hidden bg-foreground/[0.04]">
                  <Image
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform group-hover:scale-110">
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </span>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Message {String(index + 1).padStart(2, "0")}
                    </p>
                    {video.series && (
                      <span className="truncate text-xs font-semibold text-muted">
                        {video.series}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug tracking-tight">
                    {video.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {video.speaker} <span aria-hidden="true">·</span>{" "}
                    {formatSermonDate(video.date)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    Watch this message
                    <Play size={14} fill="currentColor" />
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 border border-line px-5 py-8 text-center text-sm text-muted">
          No messages match that title. Try another search or choose a different
          series.
        </p>
      )}

      {activeVideo &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video player"
              className="absolute inset-0 bg-black/85"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="teaching-video-title"
              className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-line bg-background text-foreground shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
                <div>
                  <h2
                    id="teaching-video-title"
                    className="text-lg font-semibold tracking-tight sm:text-xl"
                  >
                    {activeVideo.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {activeVideo.speaker} <span aria-hidden="true">·</span>{" "}
                    {formatSermonDate(activeVideo.date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Close video player"
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-line transition-colors hover:bg-foreground hover:text-background"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <iframe
                  key={activeVideo.id}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={`${activeVideo.title} by ${activeVideo.speaker}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
