// Theme types, presets and helpers that both the server and the admin's editor use.

export const FONTS = {
  manrope: { label: "Manrope (modern)", variable: "--font-manrope" },
  inter: { label: "Inter (clean)", variable: "--font-inter" },
  dmsans: { label: "DM Sans (friendly)", variable: "--font-dmsans" },
  lora: { label: "Lora (classic serif)", variable: "--font-lora" },
  playfair: { label: "Playfair Display (elegant serif)", variable: "--font-playfair" },
} as const;
export type FontKey = keyof typeof FONTS;

export const CORNERS = {
  round: { label: "Rounded", scale: 1 },
  soft: { label: "Subtle", scale: 0.5 },
  square: { label: "Square", scale: 0.15 },
} as const;
export type CornerKey = keyof typeof CORNERS;

export type Theme = {
  background: string;
  foreground: string;
  muted: string;
  line: string;
  accent: string;
  bodyFont: FontKey;
  headingFont: FontKey;
  corners: CornerKey;
};

export const DEFAULT_THEME: Theme = {
  background: "#ffffff",
  foreground: "#000000",
  muted: "#555555",
  line: "#e5e5e5",
  accent: "#000000",
  bodyFont: "manrope",
  headingFont: "manrope",
  corners: "round",
};

export const PRESETS: { name: string; theme: Theme }[] = [
  { name: "Original black & white", theme: DEFAULT_THEME },
  {
    name: "Royal purple",
    theme: { background: "#fdfbff", foreground: "#1d1033", muted: "#5d5370", line: "#e8e1f2", accent: "#6a2fc4", bodyFont: "manrope", headingFont: "playfair", corners: "round" },
  },
  {
    name: "Deep navy",
    theme: { background: "#fbfcfe", foreground: "#0c1a33", muted: "#4f5b70", line: "#dfe5ee", accent: "#1f5fbf", bodyFont: "inter", headingFont: "inter", corners: "soft" },
  },
  {
    name: "Warm parchment",
    theme: { background: "#faf6ef", foreground: "#2b2118", muted: "#6b5d4f", line: "#e6dccd", accent: "#a2531c", bodyFont: "lora", headingFont: "playfair", corners: "soft" },
  },
  {
    name: "Forest",
    theme: { background: "#fafcf9", foreground: "#14251b", muted: "#55665b", line: "#dde7df", accent: "#1f7a46", bodyFont: "dmsans", headingFont: "dmsans", corners: "round" },
  },
  {
    name: "Midnight (dark)",
    theme: { background: "#0e0e10", foreground: "#f4f4f5", muted: "#a1a1aa", line: "#2a2a2e", accent: "#d4af37", bodyFont: "manrope", headingFont: "playfair", corners: "round" },
  },
];

const HEX = /^#[0-9a-f]{6}$/i;

/** Returns a clean theme, or null if anything is malformed. Never trusts the client's shape. */
export function parseTheme(input: unknown): Theme | null {
  if (!input || typeof input !== "object") return null;
  const t = input as Record<string, unknown>;
  const colors = ["background", "foreground", "muted", "line", "accent"] as const;
  for (const key of colors) if (typeof t[key] !== "string" || !HEX.test(t[key] as string)) return null;
  if (typeof t.bodyFont !== "string" || !(t.bodyFont in FONTS)) return null;
  if (typeof t.headingFont !== "string" || !(t.headingFont in FONTS)) return null;
  if (typeof t.corners !== "string" || !(t.corners in CORNERS)) return null;
  return {
    background: (t.background as string).toLowerCase(),
    foreground: (t.foreground as string).toLowerCase(),
    muted: (t.muted as string).toLowerCase(),
    line: (t.line as string).toLowerCase(),
    accent: (t.accent as string).toLowerCase(),
    bodyFont: t.bodyFont as FontKey,
    headingFont: t.headingFont as FontKey,
    corners: t.corners as CornerKey,
  };
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function isDark(hex: string) {
  return luminance(hex) < 0.2;
}

/** Readability problems worth warning about before publishing. */
export function themeWarnings(theme: Theme) {
  const warnings: string[] = [];
  if (contrast(theme.foreground, theme.background) < 4.5) warnings.push("Main text is hard to read on the background.");
  if (contrast(theme.muted, theme.background) < 4.5) warnings.push("Secondary text is hard to read on the background.");
  if (contrast(theme.accent, theme.background) < 3) warnings.push("Links and highlights don't stand out from the background.");
  if (contrast(theme.line, theme.background) < 1.1) warnings.push("Dividing lines are almost invisible.");
  return warnings;
}

const RADII = { lg: 0.5, xl: 0.75, "2xl": 1, "3xl": 1.5 };

/** The CSS custom properties a theme sets; the site's Tailwind colours and radii all read these. */
export function themeVars(theme: Theme): Record<string, string> {
  const scale = CORNERS[theme.corners].scale;
  return {
    "color-scheme": isDark(theme.background) ? "dark" : "light",
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--muted": theme.muted,
    "--line": theme.line,
    "--accent": theme.accent,
    "--font-body": `var(${FONTS[theme.bodyFont].variable})`,
    "--font-heading": `var(${FONTS[theme.headingFont].variable})`,
    ...Object.fromEntries(Object.entries(RADII).map(([k, rem]) => [`--radius-${k}`, `${+(rem * scale).toFixed(3)}rem`])),
  };
}

export function themeCss(theme: Theme) {
  const body = Object.entries(themeVars(theme))
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `:root{${body}}`;
}

export function sameTheme(a: Theme, b: Theme) {
  return (Object.keys(DEFAULT_THEME) as (keyof Theme)[]).every((k) => a[k] === b[k]);
}
