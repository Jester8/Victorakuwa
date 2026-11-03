"use client";

import { useReportWebVitals } from "next/web-vitals";

/** Sends real visitors' page-speed measurements to the admin dashboard's performance panel. */
export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!["LCP", "INP", "CLS", "FCP", "TTFB"].includes(metric.name)) return;
    const body = JSON.stringify({ name: metric.name, value: metric.value, path: location.pathname });
    if (!navigator.sendBeacon?.("/api/vitals", new Blob([body], { type: "application/json" }))) {
      fetch("/api/vitals", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  });
  return null;
}
