"use client";

import { useEffect, useState, type ElementType, type ReactNode } from "react";
import { useSiteSettings } from "@/components/SiteSettings";

export default function TypewriterHeading({
  text,
  as: Tag = "h1",
  speed = 38,
  startDelay = 300,
  className,
  children,
}: {
  text: string;
  as?: ElementType;
  speed?: number;
  startDelay?: number;
  className?: string;
  children?: ReactNode;
}) {
  const { typewriter } = useSiteSettings();
  const [count, setCount] = useState(0);
  const shown = typewriter ? count : text.length;
  const done = shown >= text.length;

  useEffect(() => {
    if (!typewriter) return;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setCount((c) => {
          const next = c + 1;
          if (next >= text.length) {
            window.clearInterval(id);
            return text.length;
          }
          return next;
        });
      }, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [text, speed, startDelay, typewriter]);

  return (
    <>
      <Tag aria-label={text} className={className}>
        <span aria-hidden="true">{text.slice(0, shown)}</span>
        {typewriter && <span aria-hidden="true" className="typewriter-cursor" />}
      </Tag>
      {children ? (
        <div className={typewriter ? (done ? "fade-up" : "opacity-0") : undefined}>{children}</div>
      ) : null}
    </>
  );
}
