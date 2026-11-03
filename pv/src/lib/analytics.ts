import "server-only";
import { connection } from "next/server";
import { db } from "@/lib/db";
import type { AdminPostRow } from "@/lib/blog";

export async function recordWebVital(path: string, metric: string, value: number, device: string) {
  const sql = await db();
  await sql`insert into web_vitals (path, metric, value, device) values (${path}, ${metric}, ${value}, ${device})`;
}

export type Slice = { label: string; value: number };

/** Keeps the biggest slices and folds the rest into "Other", so a pie never has more than `max` pieces. */
function fold(rows: Slice[], max = 5): Slice[] {
  const sorted = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= max) return sorted;
  const kept = sorted.slice(0, max - 1);
  const rest = sorted.slice(max - 1).reduce((sum, r) => sum + r.value, 0);
  const other = kept.find((r) => r.label === "Other");
  if (other) {
    other.value += rest;
    return kept;
  }
  return [...kept, { label: "Other", value: rest }];
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave)\./;
const SOCIAL =
  /(^|\.)(facebook|fb|instagram|t\.co|x\.com|twitter|whatsapp|wa\.me|linkedin|lnkd|telegram|t\.me|youtube|tiktok|linktr\.ee|threads)/;

function sourceKind(host: string | null) {
  if (!host) return "Direct or app";
  if (SEARCH.test(host)) return "Search engines";
  if (SOCIAL.test(host)) return "Social media";
  return "Other websites";
}

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });
function countryName(code: string) {
  try {
    return COUNTRY_NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Who is on the site right now, plus the breakdowns behind the dashboard's pie charts. */
export async function getAudience(days: number) {
  await connection();
  const sql = await db();
  const since = sql`now() - make_interval(days => ${days})`;

  const [live] = await sql<{ visitors: number; views: number }[]>`
    select count(distinct visitor_id)::int as visitors, count(*)::int as views
    from page_views where created_at > now() - interval '5 minutes'
  `;
  const livePages = await sql<{ path: string; visitors: number }[]>`
    select path, count(distinct visitor_id)::int as visitors
    from page_views where created_at > now() - interval '5 minutes'
    group by path order by visitors desc limit 5
  `;

  // Each breakdown counts unique visitors, so one keen reader doesn't skew the picture.
  const breakdown = (column: "device" | "browser" | "country") => sql<{ key: string | null; value: number }[]>`
    select ${sql(column)} as key, count(distinct visitor_id)::int as value
    from page_views where created_at > ${since}
    group by key
  `;
  const [devices, browsers, countries, hosts, sections, reactions] = await Promise.all([
    breakdown("device"),
    breakdown("browser"),
    breakdown("country"),
    sql<{ host: string | null; value: number }[]>`
      select nullif(substring(referrer from '^https?://(?:www\\.|m\\.|l\\.|lm\\.)?([^/]+)'), '') as host,
        count(*)::int as value
      from page_views where created_at > ${since}
      group by host
    `,
    sql<{ section: string; value: number }[]>`
      select case
          when path = '/' then 'Home'
          when path like '/blog%' then 'Blog'
          when path like '/books%' then 'Books'
          when path like '/teachings%' then 'Teachings'
          when path like '/about%' then 'About'
          when path like '/contact%' then 'Contact'
          else 'Other'
        end as section,
        count(*)::int as value
      from page_views where created_at > ${since}
      group by section
    `,
    sql<{ emoji: string; value: number }[]>`
      select emoji, count(*)::int as value from (
        select emoji from post_reactions where created_at > ${since}
        union all
        select emoji from comment_reactions where created_at > ${since}
      ) r group by emoji
    `,
  ]);

  const sourceTotals = new Map<string, number>();
  const hostTotals = new Map<string, number>();
  for (const row of hosts) {
    const kind = sourceKind(row.host);
    sourceTotals.set(kind, (sourceTotals.get(kind) ?? 0) + row.value);
    if (row.host) hostTotals.set(row.host, (hostTotals.get(row.host) ?? 0) + row.value);
  }
  const topHost = [...hostTotals.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    live: { ...live, pages: livePages },
    devices: fold(devices.map((r) => ({ label: r.key ?? "Unknown", value: r.value }))),
    browsers: fold(browsers.map((r) => ({ label: r.key ?? "Unknown", value: r.value }))),
    countries: fold(
      countries.filter((r) => r.key).map((r) => ({ label: countryName(r.key!), value: r.value }))
    ),
    sources: fold([...sourceTotals].map(([label, value]) => ({ label, value }))),
    sections: fold(sections.map((r) => ({ label: r.section, value: r.value }))),
    reactions: fold(reactions.map((r) => ({ label: r.emoji, value: r.value }))),
    topHost: topHost ? { host: topHost[0], views: topHost[1] } : null,
  };
}

export type Rating = "good" | "needs-improvement" | "poor";

/** Google's Core Web Vitals thresholds: [good up to, poor from]. */
export const VITALS = {
  LCP: { label: "Main content shows", short: "Loading", unit: "s", limits: [2500, 4000] },
  INP: { label: "Responds to taps and clicks", short: "Responsiveness", unit: "ms", limits: [200, 500] },
  CLS: { label: "Layout stays still", short: "Visual stability", unit: "", limits: [0.1, 0.25] },
  FCP: { label: "First thing appears", short: "First paint", unit: "s", limits: [1800, 3000] },
  TTFB: { label: "Server answers", short: "Server speed", unit: "s", limits: [800, 1800] },
} as const;
export type VitalName = keyof typeof VITALS;

export function rate(metric: VitalName, value: number): Rating {
  const [good, poor] = VITALS[metric].limits;
  return value <= good ? "good" : value < poor ? "needs-improvement" : "poor";
}

export async function getPerformance(days: number) {
  await connection();
  const sql = await db();
  const since = sql`now() - make_interval(days => ${days})`;

  // The 75th percentile is what Google uses: three in four visits were at least this fast.
  const metrics = await sql<{ metric: VitalName; p75: number; samples: number }[]>`
    select metric, percentile_cont(0.75) within group (order by value) as p75, count(*)::int as samples
    from web_vitals where created_at > ${since}
    group by metric
  `;
  const lcpRows = await sql<{ value: number }[]>`
    select value from web_vitals where metric = 'LCP' and created_at > ${since}
  `;
  const slowPages = await sql<{ path: string; p75: number; samples: number }[]>`
    select path, percentile_cont(0.75) within group (order by value) as p75, count(*)::int as samples
    from web_vitals where metric = 'LCP' and created_at > ${since}
    group by path having count(*) >= 3
    order by p75 desc limit 5
  `;
  const byDevice = await sql<{ device: string | null; p75: number }[]>`
    select device, percentile_cont(0.75) within group (order by value) as p75
    from web_vitals where metric = 'LCP' and created_at > ${since}
    group by device
  `;

  const loads = { good: 0, "needs-improvement": 0, poor: 0 } as Record<Rating, number>;
  for (const row of lcpRows) loads[rate("LCP", row.value)]++;

  const scored = metrics
    .filter((m) => m.metric in VITALS)
    .map((m) => ({ ...m, rating: rate(m.metric, m.p75) }));
  // A simple 0-100 health score: full marks for "good", half for "needs improvement".
  const core = scored.filter((m) => m.metric === "LCP" || m.metric === "INP" || m.metric === "CLS");
  const score = core.length
    ? Math.round((core.reduce((sum, m) => sum + (m.rating === "good" ? 1 : m.rating === "poor" ? 0 : 0.5), 0) / core.length) * 100)
    : null;

  return {
    metrics: scored,
    loads,
    totalLoads: lcpRows.length,
    slowPages: slowPages.map((p) => ({ ...p, rating: rate("LCP", p.p75) })),
    byDevice: byDevice.map((d) => ({ device: d.device ?? "Unknown", p75: d.p75, rating: rate("LCP", d.p75) })),
    score,
  };
}

export async function getPeriodComparison(days: number) {
  await connection();
  const sql = await db();
  const [row] = await sql<{ views: number; prevViews: number; visitors: number; prevVisitors: number }[]>`
    select
      count(*) filter (where created_at > now() - make_interval(days => ${days}))::int as views,
      count(*) filter (where created_at <= now() - make_interval(days => ${days}))::int as "prevViews",
      count(distinct visitor_id) filter (where created_at > now() - make_interval(days => ${days}))::int as visitors,
      count(distinct visitor_id) filter (where created_at <= now() - make_interval(days => ${days}))::int as "prevVisitors"
    from page_views where created_at > now() - make_interval(days => ${days * 2})
  `;
  const [comments] = await sql<{ pending: number }[]>`
    select count(*)::int as pending from comments where hidden
  `;
  return { ...row, hiddenComments: comments.pending };
}

export type Suggestion = { tone: "good" | "tip" | "warning"; title: string; detail: string };

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Plain-language advice drawn from the numbers, most important first. */
export function buildSuggestions(input: {
  days: number;
  audience: Awaited<ReturnType<typeof getAudience>>;
  performance: Awaited<ReturnType<typeof getPerformance>>;
  comparison: Awaited<ReturnType<typeof getPeriodComparison>>;
  posts: AdminPostRow[];
  shares: number;
}): Suggestion[] {
  const { days, audience, performance, comparison, posts, shares } = input;
  const out: Suggestion[] = [];
  const metric = (name: VitalName) => performance.metrics.find((m) => m.metric === name);

  // Speed
  const lcp = metric("LCP");
  if (lcp && lcp.rating !== "good") {
    const worst = performance.slowPages[0];
    out.push({
      tone: lcp.rating === "poor" ? "warning" : "tip",
      title: "Pages are slow to show their main content",
      detail: `Three in four visits wait up to ${(lcp.p75 / 1000).toFixed(1)}s for the main picture or heading (aim for under 2.5s).${
        worst ? ` The slowest page is ${worst.path}.` : ""
      } Use smaller images, especially for blog covers and the top of each page.`,
    });
  }
  const inp = metric("INP");
  if (inp && inp.rating !== "good") {
    out.push({
      tone: inp.rating === "poor" ? "warning" : "tip",
      title: "Buttons feel slow to respond",
      detail: `Taps take up to ${Math.round(inp.p75)}ms to show a reaction (aim for under 200ms). Embedded videos and heavy posts are the usual cause; keep very long posts split into parts.`,
    });
  }
  const cls = metric("CLS");
  if (cls && cls.rating !== "good") {
    out.push({
      tone: "tip",
      title: "Content jumps around while pages load",
      detail: "Something on the page moves after it appears, which makes people tap the wrong thing. Images pasted into posts from other sites are the usual cause; upload them through the editor instead.",
    });
  }
  const ttfb = metric("TTFB");
  if (ttfb && ttfb.rating === "poor") {
    out.push({
      tone: "warning",
      title: "The server is slow to answer",
      detail: `The first byte takes ${(ttfb.p75 / 1000).toFixed(1)}s. Check the hosting and database region are close to Nigeria (Europe is closest on most hosts).`,
    });
  }
  const phoneSpeed = performance.byDevice.find((d) => d.device === "Phone");
  const computerSpeed = performance.byDevice.find((d) => d.device === "Computer");
  if (phoneSpeed && computerSpeed && phoneSpeed.p75 > computerSpeed.p75 * 1.6 && phoneSpeed.rating !== "good") {
    out.push({
      tone: "tip",
      title: "Phones load much slower than computers",
      detail: `Main content takes ${(phoneSpeed.p75 / 1000).toFixed(1)}s on phones against ${(computerSpeed.p75 / 1000).toFixed(1)}s on computers, likely due to mobile data. Lighter images help phone readers most.`,
    });
  }
  if (performance.score === 100 && performance.totalLoads >= 20) {
    out.push({ tone: "good", title: "The site is fast", detail: "Loading, responsiveness and stability all pass Google's Core Web Vitals, which helps search ranking." });
  }

  // Traffic
  const { views, prevViews } = comparison;
  if (prevViews >= 20) {
    const change = Math.round(((views - prevViews) / prevViews) * 100);
    if (change <= -25) {
      out.push({
        tone: "warning",
        title: `Traffic is down ${Math.abs(change)}%`,
        detail: `${views.toLocaleString("en-GB")} page views in the last ${days} days against ${prevViews.toLocaleString("en-GB")} the ${days} days before. A new post shared on WhatsApp and Instagram usually brings people back.`,
      });
    } else if (change >= 25) {
      out.push({
        tone: "good",
        title: `Traffic is up ${change}%`,
        detail: `${views.toLocaleString("en-GB")} page views in the last ${days} days against ${prevViews.toLocaleString("en-GB")} before. Keep the momentum with a follow-up post.`,
      });
    }
  }

  // Content
  const published = posts.filter((p) => p.status === "published" && p.publishedAt);
  const lastPublished = published.map((p) => new Date(p.publishedAt!).getTime()).sort((a, b) => b - a)[0];
  const daysSince = lastPublished ? Math.floor((Date.now() - lastPublished) / 86_400_000) : null;
  if (daysSince === null) {
    out.push({ tone: "tip", title: "Publish the first blog post", detail: "The blog is ready. A first post gives search engines and readers something to find." });
  } else if (daysSince >= 21) {
    out.push({
      tone: "tip",
      title: `No new post for ${daysSince} days`,
      detail: "Posting at least every two weeks keeps readers returning and helps Google treat the site as active.",
    });
  }
  const drafts = posts.filter((p) => p.status === "draft").length;
  if (drafts > 0) {
    out.push({ tone: "tip", title: `${drafts} draft${drafts === 1 ? "" : "s"} waiting`, detail: "Finish and publish them, or delete the ones you no longer need." });
  }
  const quiet = published.filter((p) => p.views >= 30 && p.comments === 0).sort((a, b) => b.views - a.views)[0];
  if (quiet) {
    out.push({
      tone: "tip",
      title: `"${quiet.title}" is read but not discussed`,
      detail: `${quiet.views} views and no comments yet. Ending a post with a question invites readers to respond.`,
    });
  }
  const totalPostViews = published.reduce((sum, p) => sum + p.views, 0);
  if (totalPostViews >= 100 && shares / totalPostViews < 0.01) {
    out.push({
      tone: "tip",
      title: "Few readers share posts",
      detail: "Fewer than 1 in 100 readers press a share button. A short line asking people to share with someone who needs it can lift this.",
    });
  }

  // Audience
  const visitorsTotal = audience.devices.reduce((sum, d) => sum + d.value, 0);
  const phones = audience.devices.find((d) => d.label === "Phone")?.value ?? 0;
  if (visitorsTotal >= 20 && pct(phones, visitorsTotal) >= 70) {
    out.push({
      tone: "tip",
      title: `${pct(phones, visitorsTotal)}% of visitors use a phone`,
      detail: "Preview new posts on a phone before publishing, and keep paragraphs short.",
    });
  }
  const sourceTotal = audience.sources.reduce((sum, s) => sum + s.value, 0);
  const search = audience.sources.find((s) => s.label === "Search engines")?.value ?? 0;
  if (sourceTotal >= 50 && pct(search, sourceTotal) < 10) {
    out.push({
      tone: "tip",
      title: "Few people find the site through Google",
      detail: "Add the site to Google Search Console and submit the sitemap. Posts with clear titles that match what people search for (a topic, a scripture) rank better.",
    });
  }
  if (audience.topHost && audience.topHost.views >= 20) {
    out.push({
      tone: "good",
      title: `${audience.topHost.host} sends the most visitors`,
      detail: `${audience.topHost.views.toLocaleString("en-GB")} visits came from there. Share new posts there first.`,
    });
  }
  if (comparison.hiddenComments > 0) {
    out.push({
      tone: "tip",
      title: `${comparison.hiddenComments} hidden comment${comparison.hiddenComments === 1 ? "" : "s"}`,
      detail: "Review them on the Comments page and delete any spam.",
    });
  }

  if (performance.totalLoads < 20) {
    out.push({
      tone: "tip",
      title: "Still gathering speed data",
      detail: "Speed is measured from real visitors' browsers. Give it a few days of visits for reliable numbers.",
    });
  }

  const order = { warning: 0, tip: 1, good: 2 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 8);
}
