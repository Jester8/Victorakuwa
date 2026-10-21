import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats, listAllPosts } from "@/lib/blog";

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
    <div className="rounded-2xl border border-line bg-background p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
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
      <div className="flex h-44 items-end gap-[3px]" role="img" aria-label="Daily page views">
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

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();
  const requested = Number((await searchParams).days);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 30;
  const [{ totals, daily, shareNetworks, topPages, referrers }, posts] = await Promise.all([
    getDashboardStats(days),
    listAllPosts(),
  ]);
  const topPosts = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-muted">How the website and blog are doing.</p>
        </div>
        <div className="flex rounded-full border border-line bg-background p-1 text-sm">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/admin?days=${range}`}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                range === days ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              }`}
            >
              {range} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Visitors" value={totals.visitors} hint="Unique browsers" />
        <Stat label="Page views" value={totals.views} />
        <Stat label="Commenters" value={totals.commenters} hint={`${totals.comments} comments`} />
        <Stat label="Likes" value={totals.likes} hint={`${totals.reactions} reactions in total`} />
        <Stat label="Shares & reposts" value={totals.shares} hint="From the blog's share buttons" />
        <Stat label="Comments" value={totals.comments} />
        <Stat label="Reactions" value={totals.reactions} hint="On posts and comments" />
        <Stat label="Published posts" value={totals.posts} />
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-background p-5 sm:p-6">
        <h2 className="font-semibold">Traffic</h2>
        <p className="text-sm text-muted">Page views per day, last {days} days</p>
        <div className="mt-6">
          <TrafficChart daily={daily} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-background p-5 sm:p-6">
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
                    <th className="pb-2 text-right font-medium">Likes</th>
                    <th className="pb-2 text-right font-medium">Comments</th>
                    <th className="pb-2 text-right font-medium">Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="max-w-[14rem] truncate py-2.5 pr-3">
                        <Link href={`/admin/posts/${post.id}`} className="font-medium hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{post.views}</td>
                      <td className="py-2.5 text-right tabular-nums">{post.likes}</td>
                      <td className="py-2.5 text-right tabular-nums">{post.comments}</td>
                      <td className="py-2.5 text-right tabular-nums">{post.shares}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">All-time totals for each post.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-background p-5 sm:p-6">
          <h2 className="font-semibold">Shares by platform</h2>
          <div className="mt-4">
            <BarList
              rows={shareNetworks.map((s) => ({ label: NETWORK_LABELS[s.network] ?? s.network, value: s.count }))}
              empty="No shares yet."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-background p-5 sm:p-6">
          <h2 className="font-semibold">Most visited pages</h2>
          <div className="mt-4">
            <BarList rows={topPages.map((p) => ({ label: p.path, value: p.views }))} empty="No visits yet." />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-background p-5 sm:p-6">
          <h2 className="font-semibold">Where visitors come from</h2>
          <div className="mt-4">
            <BarList rows={referrers.map((r) => ({ label: r.source, value: r.views }))} empty="No visits yet." />
          </div>
        </section>
      </div>
    </div>
  );
}
