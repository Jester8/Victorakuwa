"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { saveThemeAction, type ThemeActionState } from "@/app/admin/actions";
import { PREVIEW_KEY } from "@/components/ThemePreviewBar";
import {
  CORNERS,
  FONTS,
  PRESETS,
  sameTheme,
  themeVars,
  themeWarnings,
  type CornerKey,
  type FontKey,
  type Theme,
} from "@/lib/theme-shared";

const COLOR_FIELDS: { key: "background" | "foreground" | "muted" | "line" | "accent"; label: string; hint: string }[] = [
  { key: "background", label: "Background", hint: "Page colour" },
  { key: "foreground", label: "Text & buttons", hint: "Headings, body text, main buttons" },
  { key: "muted", label: "Secondary text", hint: "Dates, captions, descriptions" },
  { key: "line", label: "Lines & borders", hint: "Dividers and card edges" },
  { key: "accent", label: "Accent", hint: "Links, quotes, highlights" },
];

function toStyle(theme: Theme): React.CSSProperties {
  const { "color-scheme": colorScheme, ...vars } = themeVars(theme);
  return { ...vars, colorScheme, fontFamily: "var(--font-body)", background: "var(--background)", color: "var(--foreground)" } as React.CSSProperties;
}

function writePreview(theme: Theme | null) {
  try {
    if (theme) localStorage.setItem(PREVIEW_KEY, JSON.stringify(theme));
    else localStorage.removeItem(PREVIEW_KEY);
  } catch {}
}

function Preview({ theme }: { theme: Theme }) {
  const heading = { fontFamily: "var(--font-heading)" };
  return (
    <div style={toStyle(theme)} className="overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 text-sm">
        <span className="font-semibold tracking-tight" style={heading}>Pastor Victor Akuwa</span>
        <span className="hidden gap-4 text-muted sm:flex">
          <span>About</span>
          <span>Books</span>
          <span>Blog</span>
        </span>
      </div>
      <div className="px-5 py-8 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Teacher · Author · Mentor</p>
        <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-tight" style={heading}>
          Raising a generation that prevails
        </h3>
        <p className="mt-3 max-w-md leading-relaxed text-muted">
          Teachings, books and articles to help you grow in faith and purpose.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <span className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">Read the blog</span>
          <span className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">Get the books</span>
        </div>
        <div className="mt-8 rounded-2xl border border-line p-5">
          <p className="text-xs text-muted">12 March 2026 · 4 min read</p>
          <p className="mt-1.5 text-lg font-semibold" style={heading}>Walking in purpose</p>
          <p className="mt-2 text-sm leading-relaxed">
            Purpose is discovered in the place of fellowship.{" "}
            <span className="font-medium underline underline-offset-4" style={{ color: "var(--accent)" }}>
              Read more
            </span>
          </p>
          <blockquote className="mt-4 border-l-2 pl-4 text-sm italic" style={{ borderColor: "var(--accent)" }}>
            &ldquo;The just shall live by faith.&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function HexInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  const [shown, setShown] = useState(value);
  // Follow changes from the colour picker or a preset.
  if (shown !== value) {
    setShown(value);
    setText(value);
  }
  return (
    <input
      value={text}
      onChange={(e) => {
        const v = e.target.value.trim();
        setText(v);
        if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase());
      }}
      onBlur={() => setText(value)}
      aria-label={`${label} hex code`}
      maxLength={7}
      spellCheck={false}
      className="h-9 w-24 rounded-lg border border-line bg-transparent px-2.5 font-mono text-xs uppercase outline-none focus:border-foreground"
    />
  );
}

export default function ThemeEditor({ active }: { active: Theme }) {
  const [draft, setDraft] = useState<Theme>(active);
  const [base, setBase] = useState<Theme>(active);
  // When the live theme changes (a publish or a restore from history), start editing from it.
  if (!sameTheme(base, active)) {
    setBase(active);
    setDraft(active);
  }
  const [previewing, setPreviewing] = useState(false);
  const [state, formAction, saving] = useActionState<ThemeActionState, FormData>(saveThemeAction, {});
  const changed = !sameTheme(draft, active);
  const warnings = themeWarnings(draft);

  // Keep the on-site preview tab in step with every change.
  useEffect(() => {
    if (previewing) writePreview(draft);
  }, [draft, previewing]);

  useEffect(() => {
    if (state.savedAt) {
      writePreview(null);
      // The published theme replaces the preview; end preview mode after a successful save.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewing(false);
    }
  }, [state.savedAt]);

  const set = <K extends keyof Theme>(key: K, value: Theme[K]) => setDraft((t) => ({ ...t, [key]: value }));

  const openPreview = () => {
    writePreview(draft);
    setPreviewing(true);
    window.open("/", "_blank");
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Start from a preset</h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {PRESETS.map((preset) => {
              const selected = sameTheme(preset.theme, draft);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setDraft(preset.theme)}
                  aria-pressed={selected}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-sm transition-colors ${
                    selected ? "border-foreground" : "border-line hover:border-foreground/40"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-sm font-semibold"
                    style={{ background: preset.theme.background, color: preset.theme.foreground }}
                  >
                    <span className="size-3 rounded-full" style={{ background: preset.theme.accent }} />
                  </span>
                  <span className="min-w-0 leading-tight">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Colours</h2>
          <div className="mt-4 space-y-3">
            {COLOR_FIELDS.map(({ key, label, hint }) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="size-10 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block truncate text-xs text-muted">{hint}</span>
                </span>
                <HexInput label={label} value={draft[key]} onChange={(v) => set(key, v)} />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-background p-4 sm:p-6">
          <h2 className="font-semibold">Fonts & shape</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(["headingFont", "bodyFont"] as const).map((key) => (
              <label key={key} className="block text-sm">
                <span className="font-medium">{key === "headingFont" ? "Headings" : "Body text"}</span>
                <select
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value as FontKey)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-transparent px-2.5 outline-none focus:border-foreground"
                >
                  {(Object.keys(FONTS) as FontKey[]).map((font) => (
                    <option key={font} value={font}>
                      {FONTS[font].label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="mt-5 text-sm font-medium">Corners</p>
          <div className="mt-1.5 flex rounded-full border border-line p-1 text-sm">
            {(Object.keys(CORNERS) as CornerKey[]).map((corner) => (
              <button
                key={corner}
                type="button"
                aria-pressed={draft.corners === corner}
                onClick={() => set("corners", corner)}
                className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
                  draft.corners === corner ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                {CORNERS[corner].label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Preview</h2>
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ExternalLink size={15} /> Preview on the site
          </button>
        </div>
        <Preview theme={draft} />
        {previewing && (
          <p className="text-xs text-muted">
            The site tab shows this theme only in your browser and updates as you edit. Visitors still see the live theme.
          </p>
        )}

        {warnings.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-[#e7c48a] bg-[#fff8eb] p-3.5 text-sm text-[#7a4a00]">
            {warnings.map((w) => (
              <li key={w} className="flex gap-2">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {w}
              </li>
            ))}
          </ul>
        )}

        <form action={formAction} className="rounded-2xl border border-line bg-background p-4 sm:p-5">
          <input type="hidden" name="theme" value={JSON.stringify(draft)} />
          <label className="block text-sm">
            <span className="font-medium">Note for this version (optional)</span>
            <input
              name="label"
              maxLength={80}
              placeholder="e.g. Easter colours"
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-transparent px-3 outline-none focus:border-foreground"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={!changed || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Publish theme
            </button>
            <button
              type="button"
              disabled={!changed}
              onClick={() => setDraft(active)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-foreground disabled:opacity-40"
            >
              <RotateCcw size={14} /> Discard changes
            </button>
          </div>
          {state.error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.message && !changed && (
            <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-[#1a7f37]">
              <Check size={15} /> {state.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
