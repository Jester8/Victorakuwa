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

export const MOTION = {
  full: { label: "Full", duration: 0.7, distance: 24 },
  subtle: { label: "Subtle", duration: 0.4, distance: 10 },
  off: { label: "Off", duration: 0, distance: 0 },
} as const;
export type MotionKey = keyof typeof MOTION;

/** Animations and optional features the admin can switch on and off. */
export type SiteFeatures = {
  motion: MotionKey;
  smoothScroll: boolean;
  typewriter: boolean;
  heroAutoplay: boolean;
  heroSeconds: number;
  bookAutoScroll: boolean;
  booksPopup: boolean;
  popupDelay: number;
  scrollToTop: boolean;
};

export type Theme = SiteFeatures & {
  background: string;
  foreground: string;
  muted: string;
  line: string;
  accent: string;
  bodyFont: FontKey;
  headingFont: FontKey;
  corners: CornerKey;
};

export const DEFAULT_FEATURES: SiteFeatures = {
  motion: "full",
  smoothScroll: true,
  typewriter: true,
  heroAutoplay: true,
  heroSeconds: 7,
  bookAutoScroll: true,
  booksPopup: true,
  popupDelay: 0.5,
  scrollToTop: true,
};

/** Presets change the look only; they keep whatever animations and features are set. */
export type Look = Omit<Theme, keyof SiteFeatures>;

const ORIGINAL_LOOK: Look = {
  background: "#ffffff",
  foreground: "#000000",
  muted: "#555555",
  line: "#e5e5e5",
  accent: "#000000",
  bodyFont: "manrope",
  headingFont: "manrope",
  corners: "round",
};

export const DEFAULT_THEME: Theme = { ...ORIGINAL_LOOK, ...DEFAULT_FEATURES };

export const PRESETS: { name: string; theme: Look }[] = [
  { name: "Original black & white", theme: ORIGINAL_LOOK },
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

const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/**
 * Returns a clean theme, or null if anything is malformed. Never trusts the client's shape.
 * Features missing from versions saved before they existed fall back to the defaults.
 */
export function parseTheme(input: unknown): Theme | null {
  if (!input || typeof input !== "object") return null;
  const t = input as Record<string, unknown>;
  const colors = ["background", "foreground", "muted", "line", "accent"] as const;
  for (const key of colors) if (typeof t[key] !== "string" || !HEX.test(t[key] as string)) return null;
  if (typeof t.bodyFont !== "string" || !(t.bodyFont in FONTS)) return null;
  if (typeof t.headingFont !== "string" || !(t.headingFont in FONTS)) return null;
  if (typeof t.corners !== "string" || !(t.corners in CORNERS)) return null;
  const d = DEFAULT_FEATURES;
  return {
    background: (t.background as string).toLowerCase(),
    foreground: (t.foreground as string).toLowerCase(),
    muted: (t.muted as string).toLowerCase(),
    line: (t.line as string).toLowerCase(),
    accent: (t.accent as string).toLowerCase(),
    bodyFont: t.bodyFont as FontKey,
    headingFont: t.headingFont as FontKey,
    corners: t.corners as CornerKey,
    motion: typeof t.motion === "string" && t.motion in MOTION ? (t.motion as MotionKey) : d.motion,
    smoothScroll: bool(t.smoothScroll, d.smoothScroll),
    typewriter: bool(t.typewriter, d.typewriter),
    heroAutoplay: bool(t.heroAutoplay, d.heroAutoplay),
    heroSeconds: Math.round(num(t.heroSeconds, d.heroSeconds, 3, 20)),
    bookAutoScroll: bool(t.bookAutoScroll, d.bookAutoScroll),
    booksPopup: bool(t.booksPopup, d.booksPopup),
    popupDelay: Math.round(num(t.popupDelay, d.popupDelay, 0, 60) * 10) / 10,
    scrollToTop: bool(t.scrollToTop, d.scrollToTop),
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
    "--motion-duration": `${MOTION[theme.motion].duration}s`,
    "--motion-distance": `${MOTION[theme.motion].distance}px`,
    ...Object.fromEntries(Object.entries(RADII).map(([k, rem]) => [`--radius-${k}`, `${+(rem * scale).toFixed(3)}rem`])),
  };
}

/** `preview` raises specificity so a draft wins over the published theme's style tag. */
export function themeCss(theme: Theme, { preview = false } = {}) {
  const body = Object.entries(themeVars(theme))
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `${preview ? "html:root" : ":root"}{${body}}`;
}

export function sameTheme(a: Theme, b: Theme) {
  return (Object.keys(DEFAULT_THEME) as (keyof Theme)[]).every((k) => a[k] === b[k]);
}
