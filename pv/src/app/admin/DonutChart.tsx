"use client";

import { useState } from "react";

// Fixed categorical order (validated for colour-blind separation); "Other" is always neutral grey.
const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];
const OTHER = "#a3a29d";

export type DonutSlice = { label: string; value: number };

export default function DonutChart({
  title,
  slices,
  unit,
  empty = "No data yet.",
}: {
  title: string;
  slices: DonutSlice[];
  unit: string;
  empty?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const named = slices.filter((s) => s.label !== "Other");
  const colored = slices.map((s) => ({
    ...s,
    color: s.label === "Other" ? OTHER : SERIES[named.indexOf(s) % SERIES.length],
  }));

  const size = 160;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = colored.length > 1 ? 2 : 0;
  const offsets = colored.map((_, i) =>
    colored.slice(0, i).reduce((sum, s) => sum + (s.value / total) * circumference, 0)
  );

  const focus = active === null ? null : colored[active];
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <section className="@container rounded-2xl border border-line bg-background p-4 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {total === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-5 @md:flex-row">
          <div className="relative shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label={`${title}: ${colored.map((s) => `${s.label} ${pct(s.value)}%`).join(", ")}`}
              className="-rotate-90"
            >
              {colored.map((s, i) => {
                const length = (s.value / total) * circumference;
                const dash = Math.max(length - gap, 0.5);
                return (
                  <circle
                    key={s.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={active === i ? stroke + 4 : stroke}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offsets[i]}
                    opacity={active === null || active === i ? 1 : 0.35}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    className="cursor-pointer transition-all duration-150"
                  />
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-semibold tabular-nums">
                {focus ? `${pct(focus.value)}%` : total.toLocaleString("en-GB")}
              </span>
              <span className="max-w-[5.5rem] truncate text-xs text-muted">{focus ? focus.label : unit}</span>
            </div>
          </div>
          <ul className="w-full min-w-0 space-y-1 text-sm">
            {colored.map((s, i) => (
              <li
                key={s.label}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${active === i ? "bg-foreground/[0.05]" : ""}`}
              >
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <span className="tabular-nums text-muted">{pct(s.value)}%</span>
                <span className="w-12 text-right font-semibold tabular-nums">{s.value.toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
