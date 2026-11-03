"use client";

import { useEffect, useState } from "react";
import { parseTheme, themeCss, type Theme } from "@/lib/theme-shared";

export const PREVIEW_KEY = "pv-theme-preview";

function readPreview() {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? parseTheme(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * Shows an unpublished theme from the admin's editor on the real site. It lives only in the
 * admin's own browser storage, so visitors never see it. Updates live as the editor changes.
 */
export default function ThemePreviewBar() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Browser storage is only readable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readPreview());
    const onStorage = (event: StorageEvent) => {
      if (event.key === PREVIEW_KEY) setTheme(readPreview());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!theme) return null;

  const exit = () => {
    try {
      localStorage.removeItem(PREVIEW_KEY);
    } catch {}
    setTheme(null);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      <div
        role="status"
        className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm text-white shadow-lg"
      >
        <span>Theme preview · only you can see this</span>
        <button type="button" onClick={exit} className="rounded-full bg-white px-3.5 py-1.5 font-semibold text-neutral-900">
          Exit
        </button>
      </div>
    </>
  );
}
