"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { parseTheme, themeCss, type Theme } from "@/lib/theme-shared";

export const PREVIEW_KEY = "pv-theme-preview";
export const PREVIEW_MESSAGE = "pv-theme-preview";

const SiteSettingsContext = createContext<Theme | null>(null);

/** The live theme and feature switches, or the admin's unpublished draft while previewing. */
export function useSiteSettings() {
  const value = useContext(SiteSettingsContext);
  if (!value) throw new Error("useSiteSettings must be used inside <SiteSettings>.");
  return value;
}

/** True when this page is the full-site preview inside the admin's theme editor. */
export function isAdminPreviewFrame() {
  try {
    return window.parent !== window && window.parent.location.origin === window.location.origin;
  } catch {
    return false;
  }
}

function readStoredPreview() {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? parseTheme(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Follows the visitor's "reduce motion" system setting. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/**
 * Provides the site settings to every component. The admin can preview a draft two ways, both
 * only in their own browser: inside the theme editor's frame (sent by message), or in a normal
 * tab (kept in local storage, with a bar to exit). Visitors always get the published settings.
 */
export default function SiteSettings({ initial, children }: { initial: Theme; children: React.ReactNode }) {
  const [preview, setPreview] = useState<Theme | null>(null);
  const [inFrame, setInFrame] = useState(false);

  useEffect(() => {
    const framed = isAdminPreviewFrame();
    // Both depend on the browser, so they're read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInFrame(framed);
    if (framed) {
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin || event.data?.type !== PREVIEW_MESSAGE) return;
        setPreview(parseTheme(event.data.theme));
      };
      window.addEventListener("message", onMessage);
      window.parent.postMessage({ type: `${PREVIEW_MESSAGE}-ready` }, window.location.origin);
      return () => window.removeEventListener("message", onMessage);
    }
    setPreview(readStoredPreview());
    const onStorage = (event: StorageEvent) => {
      if (event.key === PREVIEW_KEY) setPreview(readStoredPreview());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const exit = () => {
    try {
      localStorage.removeItem(PREVIEW_KEY);
    } catch {}
    setPreview(null);
  };

  return (
    <SiteSettingsContext.Provider value={preview ?? initial}>
      {preview && <style dangerouslySetInnerHTML={{ __html: themeCss(preview, { preview: true }) }} />}
      {children}
      {preview && !inFrame && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-3 z-[110] mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm text-white shadow-lg"
        >
          <span>Theme preview · only you can see this</span>
          <button type="button" onClick={exit} className="rounded-full bg-white px-3.5 py-1.5 font-semibold text-neutral-900">
            Exit
          </button>
        </div>
      )}
    </SiteSettingsContext.Provider>
  );
}
