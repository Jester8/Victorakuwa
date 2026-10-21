"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlay, Loader2, Smile, X } from "lucide-react";
import EmojiPicker from "@/components/blog/EmojiPicker";
import GifPicker, { type Gif } from "@/components/blog/GifPicker";
import { toggleLocal } from "@/components/blog/PostReactions";
import {
  COMMENT_BODY_MAX,
  COMMENT_NAME_MAX,
  COMMENT_REACTIONS,
  type PublicComment,
} from "@/lib/reactions";

const NAME_KEY = "pv-comment-name";

function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}

function CommentItem({ comment, onReact }: { comment: PublicComment; onReact: (emoji: string) => void }) {
  return (
    <li className="flex gap-4 py-7">
      <div
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase text-background"
      >
        {comment.name.trim().charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{comment.name}</span>
          <span className="text-muted"> &middot; </span>
          <time className="text-muted" dateTime={comment.createdAt} suppressHydrationWarning>
            {timeAgo(comment.createdAt)}
          </time>
        </p>
        {comment.body && (
          <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{comment.body}</p>
        )}
        {comment.gifUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comment.gifUrl}
            alt="GIF"
            loading="lazy"
            className="mt-3 max-h-60 w-auto max-w-full rounded-xl"
          />
        )}
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="React to this comment">
          {COMMENT_REACTIONS.map((emoji) => {
            const active = comment.reactions.mine.includes(emoji);
            const count = comment.reactions.counts[emoji] ?? 0;
            return (
              <button
                key={emoji}
                type="button"
                aria-pressed={active}
                aria-label={`React with ${emoji}${count ? `, ${count} so far` : ""}`}
                onClick={() => onReact(emoji)}
                className={`inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs transition-all active:scale-95 ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : count
                      ? "border-line hover:border-foreground"
                      : "border-transparent opacity-50 grayscale hover:border-line hover:opacity-100 hover:grayscale-0"
                }`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                {count > 0 && <span className="font-semibold tabular-nums">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
}

export default function Comments({ slug, initial }: { slug: string; initial: PublicComment[] }) {
  const [comments, setComments] = useState(initial);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [gif, setGif] = useState<Gif | null>(null);
  const [picker, setPicker] = useState<"emoji" | "gif" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY);
      // localStorage is browser-only, so the remembered name is restored after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setName(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!picker) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !toolsRef.current?.contains(event.target as Node)) {
        setPicker(null);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [picker]);

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const next = body.slice(0, start) + emoji + body.slice(end);
    if (next.length > COMMENT_BODY_MAX) return;
    setBody(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const website = new FormData(event.currentTarget).get("website");
    if (name.trim().length < 2) return setError("Please add your name.");
    if (!body.trim() && !gif) return setError("Write something or pick a GIF.");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body, gifUrl: gif?.url ?? null, website }),
      });
      const data = (await res.json()) as { comments?: PublicComment[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't post your comment.");
      if (data.comments) setComments(data.comments);
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {}
      setBody("");
      setGif(null);
      setPicker(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't post your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const react = async (commentId: number, emoji: string) => {
    const previous = comments;
    setComments((list) =>
      list.map((c) => (c.id === commentId ? { ...c, reactions: toggleLocal(c.reactions, emoji) } : c))
    );
    const res = await fetch(`/api/blog/comments/${commentId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    }).catch(() => null);
    if (!res?.ok) setComments(previous);
  };

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-2xl font-semibold tracking-tight">
        Comments{comments.length > 0 && <span className="text-muted"> ({comments.length})</span>}
      </h2>

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-line p-4 sm:p-5">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={COMMENT_NAME_MAX}
            autoComplete="name"
            required
            placeholder="Your name"
            className="h-11 w-full border-b border-line bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted focus:border-foreground"
          />
        </label>
        <label className="mt-3 block">
          <span className="sr-only">Comment</span>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={COMMENT_BODY_MAX}
            rows={3}
            placeholder="Share your thoughts…"
            className="w-full resize-y bg-transparent py-2 leading-relaxed outline-none placeholder:text-muted"
          />
        </label>
        {/* Honeypot: hidden from people, filled in by spam bots. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        {gif && (
          <div className="relative mt-2 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gif.preview} alt="Selected GIF" className="max-h-40 rounded-xl" />
            <button
              type="button"
              onClick={() => setGif(null)}
              aria-label="Remove GIF"
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/70 text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <div ref={toolsRef} className="relative flex items-center gap-1">
            <button
              type="button"
              aria-label="Add emoji"
              aria-expanded={picker === "emoji"}
              onClick={() => setPicker(picker === "emoji" ? null : "emoji")}
              className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              aria-label="Add GIF"
              aria-expanded={picker === "gif"}
              onClick={() => setPicker(picker === "gif" ? null : "gif")}
              className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <ImagePlay size={20} />
            </button>
            {picker && (
              <div className="absolute bottom-12 left-0 z-20">
                {picker === "emoji" ? (
                  <EmojiPicker onPick={insertEmoji} />
                ) : (
                  <GifPicker
                    onPick={(picked) => {
                      setGif(picked);
                      setPicker(null);
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Post comment
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>

      {comments.length === 0 ? (
        <p className="mt-8 text-muted">No comments yet. Be the first to share a thought.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReact={(emoji) => react(comment.id, emoji)} />
          ))}
        </ul>
      )}
    </section>
  );
}
