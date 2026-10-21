"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { FacebookIcon } from "@/components/SocialIcons";
import type { ShareNetwork } from "@/lib/reactions";

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.36 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1Z" />
      <path d="M9 8.6c0 3.3 2.9 6.3 6.3 6.3l.9-1.4-1.9-.9-.8.8a4.6 4.6 0 0 1-2.4-2.4l.8-.8-.9-1.9L9.6 9" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm7 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v6.35h-4v-5.63c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.73h-4v-11Z" />
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" aria-hidden="true">
      <path d="M21.5 4.5 2.8 11.7c-.8.3-.8 1.4 0 1.7l4.6 1.5 1.8 5.4c.2.7 1.1.9 1.6.4l2.6-2.5 4.6 3.4c.6.4 1.4.1 1.6-.6L22.9 5.9c.2-.9-.6-1.6-1.4-1.4Z" />
      <path d="m7.4 14.9 10.3-7.1-7.2 8.3" />
    </svg>
  );
}

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // navigator.share only exists in the browser, so this can't be decided during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const track = (network: ShareNetwork) => {
    fetch(`/api/blog/${slug}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ network }),
      keepalive: true,
    }).catch(() => {});
  };

  const url = () => `${location.origin}/blog/${slug}`;

  const openShare = (network: ShareNetwork, href: string) => {
    track(network);
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=560");
  };

  const networks: { network: ShareNetwork; label: string; icon: React.ReactNode; href: (u: string) => string }[] = [
    { network: "x", label: "Share on X", icon: <XIcon />, href: (u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(u)}` },
    { network: "facebook", label: "Share on Facebook", icon: <FacebookIcon size={17} />, href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { network: "whatsapp", label: "Share on WhatsApp", icon: <WhatsAppIcon size={17} />, href: (u) => `https://wa.me/?text=${encodeURIComponent(`${title} ${u}`)}` },
    { network: "linkedin", label: "Share on LinkedIn", icon: <LinkedInIcon />, href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
    { network: "telegram", label: "Share on Telegram", icon: <TelegramIcon size={17} />, href: (u) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(title)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      track("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: url() });
      track("native");
    } catch {}
  };

  const buttonClass =
    "inline-flex size-11 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background";

  return (
    <div>
      <p className="text-sm font-semibold">Share this post</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {networks.map(({ network, label, icon, href }) => (
          <button key={network} type="button" aria-label={label} title={label} onClick={() => openShare(network, href(url()))} className={buttonClass}>
            {icon}
          </button>
        ))}
        <button type="button" onClick={copy} aria-label="Copy link" title="Copy link" className={buttonClass}>
          {copied ? <Check size={17} /> : <Link2 size={17} />}
        </button>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} aria-label="More sharing options" title="More options" className={buttonClass}>
            <Share2 size={17} />
          </button>
        )}
        <span className="text-sm text-muted" aria-live="polite">{copied ? "Link copied" : ""}</span>
      </div>
    </div>
  );
}
