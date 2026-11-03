import "server-only";
import { unstable_cache } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DEFAULT_THEME, parseTheme, type Theme } from "@/lib/theme-shared";

export const THEME_TAG = "site-theme";

// Caches the raw saved value. It's checked on every read (below), so a value cached before a
// setting existed still gets that setting's default.
const loadSavedTheme = unstable_cache(
  async (): Promise<unknown> => {
    if (!isDatabaseConfigured()) return null;
    try {
      const sql = await db();
      const [row] = await sql<{ theme: unknown }[]>`select theme from theme_versions order by id desc limit 1`;
      return row?.theme ?? null;
    } catch {
      return null;
    }
  },
  ["site-theme-raw"],
  { tags: [THEME_TAG] }
);

/** The live theme: the newest saved version, or the original look if none (or the database is down). */
export async function getActiveTheme(): Promise<Theme> {
  return parseTheme(await loadSavedTheme()) ?? DEFAULT_THEME;
}

export type ThemeVersion = { id: number; theme: Theme; label: string; createdAt: Date };

export async function listThemeVersions(limit = 30): Promise<ThemeVersion[]> {
  const sql = await db();
  const rows = await sql<{ id: number; theme: unknown; label: string; createdAt: Date }[]>`
    select id, theme, label, created_at as "createdAt" from theme_versions order by id desc limit ${limit}
  `;
  return rows.map((r) => ({ ...r, theme: parseTheme(r.theme) ?? DEFAULT_THEME }));
}

export async function saveThemeVersion(theme: Theme, label: string) {
  const sql = await db();
  await sql`insert into theme_versions (theme, label) values (${sql.json(theme)}, ${label.slice(0, 80)})`;
}

export async function getThemeVersion(id: number) {
  const sql = await db();
  const [row] = await sql<{ theme: unknown; label: string }[]>`select theme, label from theme_versions where id = ${id}`;
  return row ? { theme: parseTheme(row.theme), label: row.label } : null;
}
