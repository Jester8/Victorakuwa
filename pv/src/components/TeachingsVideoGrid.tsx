"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import {
  occasionLabels,
  videoTeachings,
  type Occasion,
  type VideoTeaching,
} from "@/data/videoTeachings";

const OCCASIONS = Object.keys(occasionLabels) as Occasion[];

// Headings for the single messages that aren't part of a series.
const shelfTitles: Record<Occasion, string> = {
  sunday: "More Sunday services",
  midweek: "More midweek services",
  prayer: "More prayer & worship",
  conference: "Conferences & guest ministrations",
  conversation: "Interviews & moments",
  music: "Music",
};

// The small label on each card.
const cardLabels: Record<Occasion, string> = {
  sunday: "Sunday service",
  midweek: "Midweek service",
  prayer: "Prayer & worship",
  conference: "Conference",
  conversation: "Interview & moment",
  music: "Music",
};

const newestFirst = [...videoTeachings].sort((a, b) =>
  b.date.localeCompare(a.date),
);

// A series only gets its own section once it has two or more messages.
const seriesGroups = Array.from(
  newestFirst.reduce((groups, video) => {
    if (video.series) {
      groups.set(video.series, [...(groups.get(video.series) ?? []), video]);
    }
    return groups;
  }, new Map<string, VideoTeaching[]>()),
)
  .filter(([, videos]) => videos.length > 1)
  .map(([series, videos]) => ({
    series,
    // Oldest first inside a series, so Part 1 comes before Part 2.
    videos: [...videos].reverse(),
  }));

const seriesNames = new Set(seriesGroups.map((group) => group.series));

function formatSermonDate(date: string, month: "long" | "short" = "long") {
  const [year, monthIndex, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex - 1, day)));
}

function dateRange(videos: VideoTeaching[]) {
  const first = videos[0].date;
  const last = videos[videos.length - 1].date;
  return first === last
    ? formatSermonDate(first, "short")
    : `${formatSermonDate(first, "short")} – ${formatSermonDate(last, "short")}`;
}

function VideoCard({
  video,
  onPlay,
  className = "",
}: {
  video: VideoTeaching;
  onPlay: (video: VideoTeaching) => void;
  className?: string;
}) {
  return (
    <article className={`overflow-hidden border border-line bg-background ${className}`}>
      <button
        type="button"
        onClick={() => onPlay(video)}
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
            <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {cardLabels[video.occasion]}
            </p>
            {video.series && seriesNames.has(video.series) && (
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
        </div>
      </button>
    </article>
  );
}

// One titled section: a sideways-scrolling shelf on phones, a grid from
// tablet width up.
function Shelf({
  title,
  meta,
  videos,
  onPlay,
}: {
  title: string;
  meta: string;
  videos: VideoTeaching[];
  onPlay: (video: VideoTeaching) => void;
}) {
  return (
    <section className="border-t border-line pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {meta}
        </p>
      </div>
      <div className="-mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={onPlay}
            className="w-[78%] shrink-0 snap-start sm:w-auto"
          />
        ))}
      </div>
    </section>
  );
}

export default function TeachingsVideoGrid() {
  const [activeVideo, setActiveVideo] = useState<VideoTeaching | null>(null);
  const [occasion, setOccasion] = useState<Occasion | "all">("all");
  const [series, setSeries] = useState<string | null>(null);
  const [titleSearch, setTitleSearch] = useState("");

  const searchTerm = titleSearch.trim().toLowerCase();
  const filtered = searchTerm || occasion !== "all" || series !== null;

  const visibleVideos = useMemo(
    () =>
      newestFirst.filter(
        (video) =>
          (occasion === "all" || video.occasion === occasion) &&
          (series === null || video.series === series) &&
          (!searchTerm ||
            `${video.title} ${video.series ?? ""} ${video.speaker}`
              .toLowerCase()
              .includes(searchTerm)),
      ),
    [occasion, series, searchTerm],
  );

  // The default view: every series as its own section, then the single
  // messages by occasion.
  const sections = useMemo(() => {
    const singles = newestFirst.filter(
      (video) => !video.series || !seriesNames.has(video.series),
    );
    return [
      ...seriesGroups.map(({ series: name, videos }) => ({
        key: `series-${name}`,
        title: name,
        meta: `Series · ${videos.length} messages · ${dateRange(videos)}`,
        videos,
      })),
      ...OCCASIONS.map((key) => {
        const videos = singles.filter((video) => video.occasion === key);
        return {
          key: `occasion-${key}`,
          title: shelfTitles[key],
          meta: `${videos.length} ${videos.length === 1 ? "video" : "videos"}`,
          videos,
        };
      }).filter((section) => section.videos.length > 0),
    ];
  }, []);

  const clearFilters = () => {
    setOccasion("all");
    setSeries(null);
    setTitleSearch("");
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

  const chip = (active: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center gap-2 border px-3 py-2 text-sm font-semibold transition-colors ${
      active
        ? "border-foreground bg-foreground text-background"
        : "border-line bg-background text-foreground hover:border-foreground"
    }`;

  return (
    <>
      <div className="mt-8 border border-line p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              Browse the teachings
            </p>
            <p className="mt-1 text-sm text-muted">
              {videoTeachings.length} videos, grouped by series and service.
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

        <div role="group" aria-label="Filter by service" className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setOccasion("all")} aria-pressed={occasion === "all"} className={chip(occasion === "all")}>
            All <span className="text-xs opacity-70">{videoTeachings.length}</span>
          </button>
          {OCCASIONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setOccasion(key)}
              aria-pressed={occasion === key}
              className={chip(occasion === key)}
            >
              {occasionLabels[key]}
              <span className="text-xs opacity-70">
                {videoTeachings.filter((video) => video.occasion === key).length}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Series</p>
        <div
          role="group"
          aria-label="Filter by series"
          className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {seriesGroups.map(({ series: name, videos }) => (
            <button
              key={name}
              type="button"
              onClick={() => setSeries(series === name ? null : name)}
              aria-pressed={series === name}
              className={chip(series === name)}
            >
              {name} <span className="text-xs opacity-70">{videos.length}</span>
            </button>
          ))}
        </div>

        {filtered && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-muted" aria-live="polite">
            Showing {visibleVideos.length} of {videoTeachings.length} videos, newest first.
            <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-4">
              Clear filters
            </button>
          </p>
        )}
      </div>

      {filtered ? (
        visibleVideos.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVideos.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
            ))}
          </div>
        ) : (
          <p className="mt-5 border border-line px-5 py-8 text-center text-sm text-muted">
            No videos match. Try another search or{" "}
            <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-4">
              clear the filters
            </button>
            .
          </p>
        )
      ) : (
        <div className="mt-10 space-y-12 sm:space-y-14">
          {sections.map((section) => (
            <Shelf
              key={section.key}
              title={section.title}
              meta={section.meta}
              videos={section.videos}
              onPlay={setActiveVideo}
            />
          ))}
        </div>
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
