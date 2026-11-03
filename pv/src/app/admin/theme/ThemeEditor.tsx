"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ExternalLink,
  Loader2,
  Monitor,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Tablet,
  TriangleAlert,
} from "lucide-react";
import { saveThemeAction, type ThemeActionState } from "@/app/admin/actions";
import { PREVIEW_KEY, PREVIEW_MESSAGE } from "@/components/SiteSettings";
import {
  CORNERS,
  FONTS,
  MOTION,
  PRESETS,
  sameTheme,
  themeWarnings,
  type CornerKey,
  type FontKey,
  type MotionKey,
  type Theme,
} from "@/lib/theme-shared";

const COLOR_FIELDS: { key: "background" | "foreground" | "muted" | "line" | "accent"; label: string; hint: string }[] = [
  { key: "background", label: "Background", hint: "Page colour" },
  { key: "foreground", label: "Text & buttons", hint: "Headings, body text, main buttons" },
  { key: "muted", label: "Secondary text", hint: "Dates, captions, descriptions" },
  { key: "line", label: "Lines & borders", hint: "Dividers and card edges" },
  { key: "accent", label: "Accent", hint: "Links, quotes, highlights" },
];

const PAGES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/books", label: "Books" },
  { path: "/teachings", label: "Teachings" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
];

const DEVICES = {
  desktop: { label: "Computer", width: 1280, icon: Monitor },
  tablet: { label: "Tablet", width: 820, icon: Tablet },
  phone: { label: "Phone", width: 390, icon: Smartphone },
} as const;
type Device = keyof typeof DEVICES;

const card = "rounded-2xl border border-line bg-background p-4 sm:p-5";

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

function Toggle({
  label,
  hint,
  checked,
  onChange,
  children,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <label className="flex cursor-pointer items-start gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{label}</span>
          <span className="block text-xs leading-relaxed text-muted">{hint}</span>
        </span>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span
          aria-hidden="true"
          className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-foreground/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-foreground peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground"
        />
      </label>
      {checked && children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg bg-foreground/[0.03] px-3 py-2 text-xs">
      <span className="shrink-0 text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 accent-foreground"
      />
      <span className="w-10 shrink-0 text-right font-semibold tabular-nums">
        {value}
        {unit}
      </span>
    </label>
  );
}

function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: Record<K, { label: string }>;
  value: K;
  onChange: (v: K) => void;
}) {
  return (
    <div className="flex rounded-full border border-line p-1 text-sm">
      {(Object.keys(options) as K[]).map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
            value === key ? "bg-foreground text-background" : "text-muted hover:text-foreground"
          }`}
        >
          {options[key].label}
        </button>
      ))}
    </div>
  );
}

/** The real website in a frame, scaled to fit, with the draft theme applied live. */
function SitePreview({ theme }: { theme: Theme }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState("/");
  const [device, setDevice] = useState<Device>("desktop");
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [frameKey, setFrameKey] = useState(0);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, theme }, window.location.origin);
  }, [theme]);

  useEffect(() => {
    send();
  }, [send]);

  // The site asks for the draft as soon as it's ready, including after links are clicked inside it.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === `${PREVIEW_MESSAGE}-ready`) {
        send();
        setLoading(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const deviceWidth = DEVICES[device].width;
  const scale = box.width ? Math.min(1, box.width / deviceWidth) : 1;

  const go = (path: string) => {
    setPage(path);
    setLoading(true);
    setFrameKey((k) => k + 1);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-background">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2.5">
        <select
          value={page}
          onChange={(e) => go(e.target.value)}
          aria-label="Page to preview"
          className="h-9 rounded-full border border-line bg-transparent px-3 text-sm font-medium outline-none focus:border-foreground"
        >
          {PAGES.map((p) => (
            <option key={p.path} value={p.path}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="flex rounded-full border border-line p-0.5" role="group" aria-label="Screen size">
          {(Object.keys(DEVICES) as Device[]).map((key) => {
            const Icon = DEVICES[key].icon;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={device === key}
                aria-label={DEVICES[key].label}
                title={DEVICES[key].label}
                onClick={() => setDevice(key)}
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                  device === key ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(page)}
            aria-label="Reload preview"
            title="Reload preview"
            className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(PREVIEW_KEY, JSON.stringify(theme));
              } catch {}
              window.open(page, "_blank");
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <ExternalLink size={15} /> New tab
          </button>
        </div>
      </div>

      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden bg-neutral-100">
        {loading && <div className="skeleton absolute inset-0" aria-hidden="true" />}
        {box.width > 0 && (
          <iframe
            key={frameKey}
            ref={frameRef}
            src={page}
            title="Website preview"
            onLoad={send}
            style={{
              width: deviceWidth,
              height: box.height / scale,
              transform: `scale(${scale})`,
              left: Math.max(0, (box.width - deviceWidth * scale) / 2),
            }}
            className={`absolute top-0 origin-top-left border-0 bg-white transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            } ${device !== "desktop" ? "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" : ""}`}
          />
        )}
      </div>
    </div>
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
  const [state, formAction, saving] = useActionState<ThemeActionState, FormData>(saveThemeAction, {});
  const changed = !sameTheme(draft, active);
  const warnings = themeWarnings(draft);

  useEffect(() => {
    // A published theme replaces any preview left open in another tab.
    if (state.savedAt) {
      try {
        localStorage.removeItem(PREVIEW_KEY);
      } catch {}
    }
  }, [state.savedAt]);

  const set = <K extends keyof Theme>(key: K, value: Theme[K]) => setDraft((t) => ({ ...t, [key]: value }));

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <div className="space-y-5">
        <section className={card}>
          <h2 className="font-semibold">Start from a preset</h2>
          <p className="text-xs text-muted">Changes colours and fonts. Animations stay as they are.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const selected = sameTheme({ ...draft, ...preset.theme }, draft);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setDraft((t) => ({ ...t, ...preset.theme }))}
                  aria-pressed={selected}
                  className={`flex items-center gap-2.5 rounded-xl border p-2 text-left text-sm transition-colors ${
                    selected ? "border-foreground" : "border-line hover:border-foreground/40"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line"
                    style={{ background: preset.theme.background }}
                  >
                    <span className="size-3 rounded-full" style={{ background: preset.theme.accent }} />
                  </span>
                  <span className="min-w-0 leading-tight">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Colours</h2>
          <div className="mt-4 space-y-3">
            {COLOR_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value)}
                  aria-label={label}
                  className="size-10 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block truncate text-xs text-muted">{hint}</span>
                </span>
                <HexInput label={label} value={draft[key]} onChange={(v) => set(key, v)} />
              </div>
            ))}
          </div>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Fonts & shape</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["headingFont", "bodyFont"] as const).map((key) => (
              <label key={key} className="block text-sm">
                <span className="font-medium">{key === "headingFont" ? "Headings" : "Body text"}</span>
                <select
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value as FontKey)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-transparent px-2 outline-none focus:border-foreground"
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
          <div className="mt-1.5">
            <Segmented options={CORNERS} value={draft.corners} onChange={(v: CornerKey) => set("corners", v)} />
          </div>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Animations & features</h2>
          <p className="text-xs text-muted">Fewer animations make the site lighter and faster on older phones.</p>
          <p className="mt-4 text-sm font-medium">Scroll animations</p>
          <p className="text-xs text-muted">How sections fade in as visitors scroll.</p>
          <div className="mt-1.5">
            <Segmented options={MOTION} value={draft.motion} onChange={(v: MotionKey) => set("motion", v)} />
          </div>
          <div className="mt-4 divide-y divide-line border-t border-line pt-4">
            <Toggle
              label="Smooth scrolling"
              hint="Eased, gliding page scroll. Off uses the browser's normal scroll and loads less code."
              checked={draft.smoothScroll}
              onChange={(v) => set("smoothScroll", v)}
            />
            <Toggle
              label="Typewriter headline"
              hint="The home page headline types itself out."
              checked={draft.typewriter}
              onChange={(v) => set("typewriter", v)}
            />
            <Toggle
              label="Home photo slideshow"
              hint="The large photos at the top of the home page change on their own."
              checked={draft.heroAutoplay}
              onChange={(v) => set("heroAutoplay", v)}
            >
              <Slider label="Each photo" value={draft.heroSeconds} min={3} max={20} step={1} unit="s" onChange={(v) => set("heroSeconds", v)} />
            </Toggle>
            <Toggle
              label="Books scroll by themselves"
              hint="The book carousels drift sideways slowly."
              checked={draft.bookAutoScroll}
              onChange={(v) => set("bookAutoScroll", v)}
            />
            <Toggle
              label="New books popup"
              hint="Introduces the latest books when someone arrives (never on blog posts)."
              checked={draft.booksPopup}
              onChange={(v) => set("booksPopup", v)}
            >
              <Slider label="Show after" value={draft.popupDelay} min={0} max={30} step={0.5} unit="s" onChange={(v) => set("popupDelay", v)} />
            </Toggle>
            <Toggle
              label="Back to top button"
              hint="A round arrow button appears after scrolling down."
              checked={draft.scrollToTop}
              onChange={(v) => set("scrollToTop", v)}
            />
          </div>
        </section>
      </div>

      <div className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="h-[70svh] min-h-[28rem] xl:h-[calc(100svh-15rem)]">
          <SitePreview theme={draft} />
        </div>
        <p className="text-xs text-muted">
          This is the real website with your changes. You can click around in it. Only you see these changes
          until you publish.
        </p>

        {warnings.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-[#e7c48a] bg-[#fff8eb] p-3.5 text-sm text-[#7a4a00]">
            {warnings.map((w) => (
              <li key={w} className="flex gap-2">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {w}
              </li>
            ))}
          </ul>
        )}

        <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-background p-4">
          <input type="hidden" name="theme" value={JSON.stringify(draft)} />
          <label className="min-w-48 flex-1 text-sm">
            <span className="font-medium">Note for this version (optional)</span>
            <input
              name="label"
              maxLength={80}
              placeholder="e.g. Easter colours"
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-transparent px-3 outline-none focus:border-foreground"
            />
          </label>
          <button
            type="button"
            disabled={!changed}
            onClick={() => setDraft(active)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-foreground disabled:opacity-40"
          >
            <RotateCcw size={14} /> Discard
          </button>
          <button
            type="submit"
            disabled={!changed || saving}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Publish
          </button>
          {state.error && (
            <p role="alert" className="w-full text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.message && !changed && (
            <p role="status" className="flex w-full items-center gap-1.5 text-sm text-[#1a7f37]">
              <Check size={15} /> {state.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
