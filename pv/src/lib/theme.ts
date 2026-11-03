import "server-only";
import { unstable_cache } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DEFAULT_THEME, parseTheme, type Theme } from "@/lib/theme-shared";

export const THEME_TAG = "site-theme";

/** The live theme: the newest saved version, or the original look if none (or the database is down). */
export const getActiveTheme = unstable_cache(
  async (): Promise<Theme> => {
    if (!isDatabaseConfigured()) return DEFAULT_THEME;
    try {
      const sql = await db();
      const [row] = await sql<{ theme: unknown }[]>`select theme from theme_versions order by id desc limit 1`;
      return (row && parseTheme(row.theme)) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  },
  ["site-theme"],
  { tags: [THEME_TAG] }
);

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
