"use client";

// The Razzl wordmark stays expressive through typography, not cursor-driven movement.
export default function Letters({ text }: { text: string }) {
  return <span aria-label={text}>{text}</span>;
}
