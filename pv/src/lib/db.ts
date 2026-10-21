import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  pvSql?: Sql;
  pvSchema?: Promise<void>;
};

function client(): Sql {
  if (globalForDb.pvSql) return globalForDb.pvSql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add a Postgres connection string to .env.local.");
  }
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  globalForDb.pvSql = postgres(url, {
    ssl: isLocal ? false : "require",
    max: 5,
    idle_timeout: 20,
    // Pooled serverless endpoints (Neon, Supabase) don't support prepared statements.
    prepare: false,
  });
  return globalForDb.pvSql;
}

// Tables are created on first use, so a fresh database needs no manual migration step.
const schema = `
  create table if not exists posts (
    id serial primary key,
    slug text not null unique,
    title text not null,
    excerpt text not null default '',
    cover_url text,
    content_html text not null default '',
    status text not null default 'draft' check (status in ('draft', 'published')),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists comments (
    id serial primary key,
    post_id integer not null references posts(id) on delete cascade,
    visitor_id text not null,
    name text not null,
    body text not null default '',
    gif_url text,
    hidden boolean not null default false,
    created_at timestamptz not null default now()
  );
  create index if not exists comments_post_idx on comments (post_id, created_at);

  create table if not exists post_reactions (
    post_id integer not null references posts(id) on delete cascade,
    visitor_id text not null,
    emoji text not null,
    created_at timestamptz not null default now(),
    primary key (post_id, visitor_id, emoji)
  );

  create table if not exists comment_reactions (
    comment_id integer not null references comments(id) on delete cascade,
    visitor_id text not null,
    emoji text not null,
    created_at timestamptz not null default now(),
    primary key (comment_id, visitor_id, emoji)
  );

  create table if not exists shares (
    id serial primary key,
    post_id integer not null references posts(id) on delete cascade,
    visitor_id text not null,
    network text not null,
    created_at timestamptz not null default now()
  );
  create index if not exists shares_post_idx on shares (post_id);

  create table if not exists page_views (
    id bigserial primary key,
    path text not null,
    post_id integer references posts(id) on delete set null,
    visitor_id text not null,
    referrer text,
    created_at timestamptz not null default now()
  );
  create index if not exists page_views_created_idx on page_views (created_at);
  create index if not exists page_views_post_idx on page_views (post_id);
`;

export async function db(): Promise<Sql> {
  const sql = client();
  globalForDb.pvSchema ??= sql.unsafe(schema).then(
    () => undefined,
    (error) => {
      globalForDb.pvSchema = undefined;
      throw error;
    }
  );
  await globalForDb.pvSchema;
  return sql;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
