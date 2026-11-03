import Link from "next/link";
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats, listAllPosts } from "@/lib/blog";
import {
  buildSuggestions,
  getAudience,
  getPerformance,
  getPeriodComparison,
  VITALS,
  type Rating,
  type Suggestion,
  type VitalName,
} from "@/lib/analytics";
import DonutChart from "@/app/admin/DonutChart";
import LiveRefresh from "@/app/admin/LiveRefresh";

const RANGES = [7, 30, 90] as const;

const NETWORK_LABELS: Record<string, string> = {
  x: "X",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  copy: "Copied link",
  native: "Phone share sheet",
};

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-background p-4 sm:p-5">
      <p className="truncate text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight">
        {value.toLocaleString("en-GB")}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function BarList({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label} className="relative overflow-hidden rounded-lg">
          <div
            className="absolute inset-y-0 left-0 rounded-lg bg-foreground/[0.06]"
            style={{ width: `${(row.value / max) * 100}%` }}
          />
          <div className="relative flex items-center justify-between gap-4 px-3 py-2 text-sm">
            <span className="truncate">{row.label}</span>
            <span className="font-semibold tabular-nums">{row.value.toLocaleString("en-GB")}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TrafficChart({ daily }: { daily: { day: string; views: number; visitors: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  const fmt = (day: string) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
      new Date(`${day}T00:00:00Z`)
    );
  return (
    <div>
      <div className="flex h-36 items-end gap-px sm:h-44 sm:gap-[3px]" role="img" aria-label="Daily page views">
        {daily.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-[3px] bg-foreground/80 transition-colors group-hover:bg-foreground"
              style={{ height: `${Math.max((d.views / max) * 100, d.views ? 3 : 1)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background group-hover:block">
              {fmt(d.day)}: {d.views} views, {d.visitors} visitors
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{daily[0] && fmt(daily[0].day)}</span>
        <span>{daily.at(-1) && fmt(daily.at(-1)!.day)}</span>
      </div>
    </div>
  );
}

const RATING_STYLE: Record<Rating, { label: string; dot: string; text: string }> = {
  good: { label: "Good", dot: "#1a7f37", text: "text-[#1a7f37]" },
  "needs-improvement": { label: "Needs work", dot: "#b76e00", text: "text-[#9a5c00]" },
  poor: { label: "Poor", dot: "#c62828", text: "text-[#c62828]" },
};

function formatVital(metric: VitalName, value: number) {
  if (metric === "CLS") return value.toFixed(2);
  if (metric === "INP") return `${Math.round(value)}ms`;
  return `${(value / 1000).toFixed(1)}s`;
}

function RatingBadge({ rating }: { rating: Rating }) {
  const style = RATING_STYLE[rating];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${style.text}`}>
      <span aria-hidden="true" className="size-2 rounded-full" style={{ background: style.dot }} />
      {style.label}
    </span>
  );
}

const SUGGESTION_STYLE: Record<Suggestion["tone"], { icon: typeof Lightbulb; className: string; label: string }> = {
  warning: { icon: AlertTriangle, className: "text-[#c62828]", label: "Needs attention" },
  tip: { icon: Lightbulb, className: "text-[#9a5c00]", label: "Suggestion" },
  good: { icon: CheckCircle2, className: "text-[#1a7f37]", label: "Going well" },
};

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();
  const requested = Number((await searchParams).days);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 30;
  const [{ totals, daily, shareNetworks, topPages, referrers }, posts, audience, performance, comparison] =
    await Promise.all([
      getDashboardStats(days),
      listAllPosts(),
      getAudience(days),
      getPerformance(days),
      getPeriodComparison(days),
    ]);
  const suggestions = buildSuggestions({ days, audience, performance, comparison, posts, shares: totals.shares });
  const viewChange =
    comparison.prevViews > 0 ? Math.round(((comparison.views - comparison.prevViews) / comparison.prevViews) * 100) : null;
  const topPosts = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted sm:text-base">How the website and blog are doing.</p>
          <div className="mt-2">
            <LiveRefresh />
          </div>
        </div>
        <div className="flex w-full rounded-full border border-line bg-background p-1 text-sm sm:w-auto">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/admin?days=${range}`}
              className={`flex-1 rounded-full px-4 py-1.5 text-center font-medium transition-colors sm:flex-none ${
                range === days ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              }`}
            >
              {range} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4">
        <Stat label="Visitors" value={totals.visitors} hint="Unique browsers" />
        <Stat label="Page views" value={totals.views} />
        <Stat label="Commenters" value={totals.commenters} hint={`${totals.comments} comments`} />
        <Stat label="Likes" value={totals.likes} hint={`${totals.reactions} reactions in total`} />
        <Stat label="Shares & reposts" value={totals.shares} hint="From the blog's share buttons" />
        <Stat label="Comments" value={totals.comments} />
        <Stat label="Reactions" value={totals.reactions} hint="On posts and comments" />
        <Stat label="Published posts" value={totals.posts} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">On the site right now</h2>
          <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight">{audience.live.visitors}</p>
          <p className="text-sm text-muted">
            {audience.live.visitors === 1 ? "visitor" : "visitors"} in the last 5 minutes
          </p>
          {audience.live.pages.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              {audience.live.pages.map((page) => (
                <li key={page.path} className="flex items-center justify-between gap-3">
                  <span className="truncate">{page.path}</span>
                  <span className="font-semibold tabular-nums">{page.visitors}</span>
                </li>
              ))}
            </ul>
          )}
          {viewChange !== null && (
            <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
              Page views are{" "}
              <span className={`font-semibold ${viewChange >= 0 ? "text-[#1a7f37]" : "text-[#c62828]"}`}>
                {viewChange >= 0 ? "up" : "down"} {Math.abs(viewChange)}%
              </span>{" "}
              on the previous {days} days.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">How the site is faring</h2>
          <p className="text-sm text-muted">Suggestions based on the last {days} days</p>
          {suggestions.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing needs attention right now.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {suggestions.map((item) => {
                const style = SUGGESTION_STYLE[item.tone];
                const Icon = style.icon;
                return (
                  <li key={item.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <Icon size={18} className={`mt-0.5 shrink-0 ${style.className}`} aria-label={style.label} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-background p-4 sm:p-6">
        <h2 className="font-semibold">Traffic</h2>
        <p className="text-sm text-muted">Page views per day, last {days} days</p>
        <div className="mt-6">
          <TrafficChart daily={daily} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DonutChart title="Devices" slices={audience.devices} unit="visitors" empty="No visits recorded yet." />
        <DonutChart title="Traffic sources" slices={audience.sources} unit="page views" empty="No visits recorded yet." />
        <DonutChart title="Sections visited" slices={audience.sections} unit="page views" empty="No visits recorded yet." />
        <DonutChart title="Browsers" slices={audience.browsers} unit="visitors" empty="No visits recorded yet." />
        <DonutChart
          title="Countries"
          slices={audience.countries}
          unit="visitors"
          empty="Countries appear once the site is live on Vercel."
        />
        <DonutChart title="Reactions" slices={audience.reactions} unit="reactions" empty="No reactions yet." />
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-background p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Performance</h2>
            <p className="text-sm text-muted">
              Measured in real visitors&apos; browsers. Three in four visits were at least this fast.
            </p>
          </div>
          {performance.score !== null && (
            <div className="text-right">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {performance.score}
                <span className="text-base font-normal text-muted">/100</span>
              </p>
              <p className="text-xs text-muted">Speed score</p>
            </div>
          )}
        </div>

        {performance.metrics.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No speed data yet. It is collected automatically as people visit the site.
          </p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(Object.keys(VITALS) as VitalName[]).map((name) => {
                const m = performance.metrics.find((x) => x.metric === name);
                return (
                  <div key={name} className="rounded-xl border border-line p-3.5">
                    <p className="text-xs text-muted">{VITALS[name].label}</p>
                    <p className="mt-1.5 text-xl font-semibold tabular-nums">{m ? formatVital(name, m.p75) : "—"}</p>
                    <div className="mt-1">{m ? <RatingBadge rating={m.rating} /> : <span className="text-xs text-muted">No data</span>}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Page loads by speed</h3>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-foreground/[0.06]">
                  {(["good", "needs-improvement", "poor"] as Rating[]).map((rating) =>
                    performance.loads[rating] ? (
                      <div
                        key={rating}
                        style={{
                          width: `${(performance.loads[rating] / performance.totalLoads) * 100}%`,
                          background: RATING_STYLE[rating].dot,
                        }}
                        className="border-r-2 border-background last:border-r-0"
                      />
                    ) : null
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  {(["good", "needs-improvement", "poor"] as Rating[]).map((rating) => (
                    <li key={rating} className="flex items-center gap-2">
                      <RatingBadge rating={rating} />
                      <span className="tabular-nums text-muted">
                        {Math.round((performance.loads[rating] / Math.max(performance.totalLoads, 1)) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
                {performance.byDevice.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                    {performance.byDevice.map((d) => (
                      <li key={d.device} className="flex items-center justify-between gap-3">
                        <span>{d.device}</span>
                        <span className="flex items-center gap-3">
                          <span className="tabular-nums">{formatVital("LCP", d.p75)}</span>
                          <RatingBadge rating={d.rating} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold">Slowest pages</h3>
                {performance.slowPages.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Needs a few more visits per page.</p>
                ) : (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {performance.slowPages.map((page) => (
                      <li key={page.path} className="flex items-center justify-between gap-3">
                        <span className="truncate">{page.path}</span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="tabular-nums">{formatVital("LCP", page.p75)}</span>
                          <RatingBadge rating={page.rating} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Top posts</h2>
          {topPosts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No published posts yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="pb-2 font-medium">Post</th>
                    <th className="pb-2 text-right font-medium">Views</th>
                    <th className="hidden pb-2 text-right font-medium sm:table-cell">Likes</th>
                    <th className="pb-2 pl-2 text-right font-medium">Comments</th>
                    <th className="hidden pb-2 text-right font-medium sm:table-cell">Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="max-w-[10rem] truncate py-2.5 pr-3 sm:max-w-[14rem]">
                        <Link href={`/admin/posts/${post.id}`} className="font-medium hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{post.views}</td>
                      <td className="hidden py-2.5 text-right tabular-nums sm:table-cell">{post.likes}</td>
                      <td className="py-2.5 text-right tabular-nums">{post.comments}</td>
                      <td className="hidden py-2.5 text-right tabular-nums sm:table-cell">{post.shares}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">All-time totals for each post.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Shares by platform</h2>
          <div className="mt-4">
            <BarList
              rows={shareNetworks.map((s) => ({ label: NETWORK_LABELS[s.network] ?? s.network, value: s.count }))}
              empty="No shares yet."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Most visited pages</h2>
          <div className="mt-4">
            <BarList rows={topPages.map((p) => ({ label: p.path, value: p.views }))} empty="No visits yet." />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Where visitors come from</h2>
          <div className="mt-4">
            <BarList rows={referrers.map((r) => ({ label: r.source, value: r.views }))} empty="No visits yet." />
          </div>
        </section>
      </div>
    </div>
  );
}
