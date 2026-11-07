"use client";

import { useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

const fieldClass =
  "mt-2 min-h-12 w-full border border-line bg-background px-4 font-normal outline-none transition-colors placeholder:text-muted focus:border-foreground";
const labelClass = "block text-sm font-semibold";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "Your message could not be sent. Please try again.");
      form.reset();
      setMessage({ text: result.message || "Thank you. Your message has been sent.", error: false });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Your message could not be sent. Please try again.",
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 border border-line bg-background p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required className={fieldClass} placeholder="Your name" />
        </label>
        <label className={labelClass}>
          Email
          <input name="email" type="email" autoComplete="email" maxLength={254} required className={fieldClass} placeholder="you@example.com" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          What is this about?
          <select name="purpose" defaultValue="Invitation to speak" required className={fieldClass}>
            <option>Invitation to speak</option>
            <option>Church or ministry invitation</option>
            <option>Mentorship</option>
            <option>Book enquiry</option>
            <option>Other message</option>
          </select>
        </label>
        <label className={labelClass}>
          Church or organization <span className="font-normal text-muted">(optional)</span>
          <input name="organization" type="text" maxLength={120} className={fieldClass} placeholder="Organization name" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Event date <span className="font-normal text-muted">(optional)</span>
          <input name="eventDate" type="date" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Venue or location <span className="font-normal text-muted">(optional)</span>
          <input name="venue" type="text" maxLength={160} className={fieldClass} placeholder="City, venue, or online" />
        </label>
      </div>

      <label className={labelClass}>
        Message
        <textarea
          name="message"
          rows={5}
          minLength={10}
          maxLength={4000}
          required
          className="mt-2 w-full resize-y border border-line bg-background px-4 py-3 font-normal outline-none transition-colors placeholder:text-muted focus:border-foreground"
          placeholder="Share the invitation details, event theme, and any other helpful information."
        />
      </label>

      <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
          {submitting ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
        </button>
        <p aria-live="polite" className={`text-sm ${message?.error ? "text-red-700" : "text-muted"}`}>
          {message?.text ?? "Submissions are emailed directly to vakuwa@gmail.com."}
        </p>
      </div>
    </form>
  );
}
