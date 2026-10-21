import "server-only";
import { connection } from "next/server";
import { db } from "@/lib/db";
import {
  COMMENT_REACTIONS,
  LIKE_EMOJI,
  POST_REACTIONS,
  type PublicComment,
  type ReactionSummary,
} from "@/lib/reactions";

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  contentHtml: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string | null;
  content_html: string;
  status: "draft" | "published";
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverUrl: row.cover_url,
    contentHtml: row.content_html,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------- Public reads ----------

export async function listPublishedPosts() {
  await connection();
  const sql = await db();
  const rows = await sql<PostRow[]>`
    select * from posts
    where status = 'published' and published_at <= now()
    order by published_at desc
  `;
  return rows.map(toPost);
}

export async function getPublishedPost(slug: string) {
  await connection();
  const sql = await db();
  const [row] = await sql<PostRow[]>`
    select * from posts
    where slug = ${slug} and status = 'published' and published_at <= now()
  `;
  return row ? toPost(row) : null;
}

export async function getPublishedPostId(slug: string) {
  const sql = await db();
  const [row] = await sql<{ id: number }[]>`
    select id from posts where slug = ${slug} and status = 'published'
  `;
  return row?.id ?? null;
}

// ---------- Reactions ----------

function summarise(
  rows: { emoji: string; count: number }[],
  mine: { emoji: string }[]
): ReactionSummary {
  return {
    counts: Object.fromEntries(rows.map((r) => [r.emoji, Number(r.count)])),
    mine: mine.map((r) => r.emoji),
  };
}

export async function getPostReactions(postId: number, visitorId: string | null) {
  const sql = await db();
  const [counts, mine] = await Promise.all([
    sql<{ emoji: string; count: number }[]>`
      select emoji, count(*)::int as count from post_reactions
      where post_id = ${postId} group by emoji
    `,
    visitorId
      ? sql<{ emoji: string }[]>`
          select emoji from post_reactions
          where post_id = ${postId} and visitor_id = ${visitorId}
        `
      : Promise.resolve([]),
  ]);
  return summarise(counts, mine);
}

export async function togglePostReaction(postId: number, visitorId: string, emoji: string) {
  if (!(POST_REACTIONS as readonly string[]).includes(emoji)) return;
  const sql = await db();
  const removed = await sql`
    delete from post_reactions
    where post_id = ${postId} and visitor_id = ${visitorId} and emoji = ${emoji}
    returning 1
  `;
  if (removed.length === 0) {
    await sql`
      insert into post_reactions (post_id, visitor_id, emoji)
      values (${postId}, ${visitorId}, ${emoji})
      on conflict do nothing
    `;
  }
}

export async function toggleCommentReaction(commentId: number, visitorId: string, emoji: string) {
  if (!(COMMENT_REACTIONS as readonly string[]).includes(emoji)) return false;
  const sql = await db();
  const [comment] = await sql`
    select 1 from comments c join posts p on p.id = c.post_id
    where c.id = ${commentId} and not c.hidden and p.status = 'published'
  `;
  if (!comment) return false;
  const removed = await sql`
    delete from comment_reactions
    where comment_id = ${commentId} and visitor_id = ${visitorId} and emoji = ${emoji}
    returning 1
  `;
  if (removed.length === 0) {
    await sql`
      insert into comment_reactions (comment_id, visitor_id, emoji)
      values (${commentId}, ${visitorId}, ${emoji})
      on conflict do nothing
    `;
  }
  return true;
}

// ---------- Comments ----------

export async function listComments(postId: number, visitorId: string | null) {
  const sql = await db();
  const comments = await sql<
    { id: number; name: string; body: string; gif_url: string | null; created_at: Date }[]
  >`
    select id, name, body, gif_url, created_at from comments
    where post_id = ${postId} and not hidden
    order by created_at asc
  `;
  if (comments.length === 0) return [] as PublicComment[];

  const ids = comments.map((c) => c.id);
  const [counts, mine] = await Promise.all([
    sql<{ comment_id: number; emoji: string; count: number }[]>`
      select comment_id, emoji, count(*)::int as count from comment_reactions
      where comment_id = any(${ids}) group by comment_id, emoji
    `,
    visitorId
      ? sql<{ comment_id: number; emoji: string }[]>`
          select comment_id, emoji from comment_reactions
          where comment_id = any(${ids}) and visitor_id = ${visitorId}
        `
      : Promise.resolve([]),
  ]);

  return comments.map<PublicComment>((c) => ({
    id: c.id,
    name: c.name,
    body: c.body,
    gifUrl: c.gif_url,
    createdAt: c.created_at.toISOString(),
    reactions: {
      counts: Object.fromEntries(
        counts.filter((r) => r.comment_id === c.id).map((r) => [r.emoji, Number(r.count)])
      ),
      mine: mine.filter((r) => r.comment_id === c.id).map((r) => r.emoji),
    },
  }));
}

export async function recentCommentCount(visitorId: string, minutes: number) {
  const sql = await db();
  const [row] = await sql<{ count: number }[]>`
    select count(*)::int as count from comments
    where visitor_id = ${visitorId} and created_at > now() - make_interval(mins => ${minutes})
  `;
  return row.count;
}

export async function addComment(input: {
  postId: number;
  visitorId: string;
  name: string;
  body: string;
  gifUrl: string | null;
}) {
  const sql = await db();
  await sql`
    insert into comments (post_id, visitor_id, name, body, gif_url)
    values (${input.postId}, ${input.visitorId}, ${input.name}, ${input.body}, ${input.gifUrl})
  `;
}

// ---------- Shares and views ----------

export async function recordShare(postId: number, visitorId: string, network: string) {
  const sql = await db();
  await sql`
    insert into shares (post_id, visitor_id, network)
    values (${postId}, ${visitorId}, ${network})
  `;
}

export async function recordPageView(path: string, visitorId: string, referrer: string | null) {
  const sql = await db();
  const slug = path.match(/^\/blog\/([^/?#]+)/)?.[1];
  const postId = slug ? await getPublishedPostId(decodeURIComponent(slug)) : null;
  await sql`
    insert into page_views (path, post_id, visitor_id, referrer)
    values (${path}, ${postId}, ${visitorId}, ${referrer})
  `;
}

// ---------- Admin ----------

const TIME_ZONE = "Africa/Lagos";

export type AdminPostRow = Post & {
  views: number;
  likes: number;
  comments: number;
  shares: number;
};

export async function listAllPosts(): Promise<AdminPostRow[]> {
  await connection();
  const sql = await db();
  const rows = await sql<(PostRow & { views: number; likes: number; comments: number; shares: number })[]>`
    select p.*,
      (select count(*)::int from page_views v where v.post_id = p.id) as views,
      (select count(*)::int from post_reactions r where r.post_id = p.id and r.emoji = ${LIKE_EMOJI}) as likes,
      (select count(*)::int from comments c where c.post_id = p.id) as comments,
      (select count(*)::int from shares s where s.post_id = p.id) as shares
    from posts p
    order by coalesce(p.published_at, p.updated_at) desc
  `;
  return rows.map((row) => ({
    ...toPost(row),
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
  }));
}

export async function getPostById(id: number) {
  await connection();
  const sql = await db();
  const [row] = await sql<PostRow[]>`select * from posts where id = ${id}`;
  return row ? toPost(row) : null;
}

export async function slugExists(slug: string, exceptId?: number) {
  const sql = await db();
  const [row] = await sql`
    select 1 from posts where slug = ${slug} and id <> ${exceptId ?? 0}
  `;
  return Boolean(row);
}

export async function savePost(input: {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  contentHtml: string;
  status: "draft" | "published";
}) {
  const sql = await db();
  if (input.id) {
    const [row] = await sql<{ id: number }[]>`
      update posts set
        slug = ${input.slug},
        title = ${input.title},
        excerpt = ${input.excerpt},
        cover_url = ${input.coverUrl},
        content_html = ${input.contentHtml},
        status = ${input.status},
        published_at = case
          when ${input.status} = 'published' then coalesce(published_at, now())
          else published_at
        end,
        updated_at = now()
      where id = ${input.id}
      returning id
    `;
    return row?.id ?? null;
  }
  const [row] = await sql<{ id: number }[]>`
    insert into posts (slug, title, excerpt, cover_url, content_html, status, published_at)
    values (
      ${input.slug}, ${input.title}, ${input.excerpt}, ${input.coverUrl}, ${input.contentHtml},
      ${input.status}, ${input.status === "published" ? sql`now()` : null}
    )
    returning id
  `;
  return row.id;
}

export async function deletePost(id: number) {
  const sql = await db();
  await sql`delete from posts where id = ${id}`;
}

export type AdminComment = {
  id: number;
  name: string;
  body: string;
  gifUrl: string | null;
  hidden: boolean;
  createdAt: Date;
  postTitle: string;
  postSlug: string;
  reactions: number;
};

export async function listAllComments(limit = 200): Promise<AdminComment[]> {
  await connection();
  const sql = await db();
  const rows = await sql<
    {
      id: number; name: string; body: string; gif_url: string | null; hidden: boolean;
      created_at: Date; title: string; slug: string; reactions: number;
    }[]
  >`
    select c.id, c.name, c.body, c.gif_url, c.hidden, c.created_at, p.title, p.slug,
      (select count(*)::int from comment_reactions r where r.comment_id = c.id) as reactions
    from comments c join posts p on p.id = c.post_id
    order by c.created_at desc
    limit ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    body: r.body,
    gifUrl: r.gif_url,
    hidden: r.hidden,
    createdAt: r.created_at,
    postTitle: r.title,
    postSlug: r.slug,
    reactions: r.reactions,
  }));
}

export async function setCommentHidden(id: number, hidden: boolean) {
  const sql = await db();
  await sql`update comments set hidden = ${hidden} where id = ${id}`;
}

export async function deleteComment(id: number) {
  const sql = await db();
  await sql`delete from comments where id = ${id}`;
}

export async function getDashboardStats(days: number) {
  await connection();
  const sql = await db();
  const since = sql`now() - make_interval(days => ${days})`;

  const [totals] = await sql<
    {
      views: number; visitors: number; commenters: number; comments: number;
      likes: number; reactions: number; shares: number; posts: number;
    }[]
  >`
    select
      (select count(*)::int from page_views where created_at > ${since}) as views,
      (select count(distinct visitor_id)::int from page_views where created_at > ${since}) as visitors,
      (select count(distinct visitor_id)::int from comments where created_at > ${since}) as commenters,
      (select count(*)::int from comments where created_at > ${since}) as comments,
      (select count(*)::int from post_reactions where emoji = ${LIKE_EMOJI} and created_at > ${since}) as likes,
      (select count(*)::int from post_reactions where created_at > ${since})
        + (select count(*)::int from comment_reactions where created_at > ${since}) as reactions,
      (select count(*)::int from shares where created_at > ${since}) as shares,
      (select count(*)::int from posts where status = 'published') as posts
  `;

  // Days are bucketed in Lagos time, where most of PV's readers are.
  const daily = await sql<{ day: string; views: number; visitors: number }[]>`
    with days as (
      select generate_series(
        (now() at time zone ${TIME_ZONE})::date - ${days - 1}::int,
        (now() at time zone ${TIME_ZONE})::date,
        interval '1 day'
      )::date as day
    )
    select to_char(d.day, 'YYYY-MM-DD') as day,
      count(v.id)::int as views,
      count(distinct v.visitor_id)::int as visitors
    from days d
    left join page_views v on (v.created_at at time zone ${TIME_ZONE})::date = d.day
    group by d.day
    order by d.day
  `;

  const shareNetworks = await sql<{ network: string; count: number }[]>`
    select network, count(*)::int as count from shares
    where created_at > ${since}
    group by network order by count desc
  `;

  const topPages = await sql<{ path: string; views: number }[]>`
    select path, count(*)::int as views from page_views
    where created_at > ${since}
    group by path order by views desc limit 8
  `;

  const referrers = await sql<{ source: string; views: number }[]>`
    select coalesce(nullif(substring(referrer from '^https?://(?:www\\.)?([^/]+)'), ''), 'Direct') as source,
      count(*)::int as views
    from page_views
    where created_at > ${since}
    group by source order by views desc limit 8
  `;

  return { totals, daily, shareNetworks, topPages, referrers };
}
