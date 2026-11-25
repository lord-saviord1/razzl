"use client";

// The Razzl wordmark stays expressive through typography, not cursor-driven movement.
export default function Letters({ text }: { text: string }) {
  return <span className="letter-motion" aria-label={text}>{text}</span>;
}
