"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ElementType, type ReactNode } from "react";

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
  const [count, setCount] = useState(0);
  const done = count >= text.length;

  useEffect(() => {
    const start = setTimeout(() => {
      const id = setInterval(() => {
        setCount((c) => {
          const next = c + 1;
          if (next >= text.length) {
            clearInterval(id);
            return text.length;
          }
          return next;
        });
      }, speed);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, speed, startDelay]);

  return (
    <>
      <Tag aria-label={text} className={className}>
        <span aria-hidden="true">{text.slice(0, count)}</span>
        <span aria-hidden="true" className="typewriter-cursor" />
      </Tag>
      {children ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      ) : null}
    </>
  );
}
