"use client";
import { useEffect, useRef } from "react";

// Letters lean toward and lift away from the pointer ("move your cursor across the word").
export default function Letters({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(ref.current!.querySelectorAll("span")) as HTMLElement[];
    let mx = -999, my = -999, raf = 0;
    const mv = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      spans.forEach((s) => {
        const r = s.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(mx - cx, my - cy), k = Math.max(0, 1 - d / 280);
        s.style.transform = `translateY(${-k * 22}px) rotate(${((mx - cx) / 280) * k * 12}deg) scale(${1 + k * 0.2})`;
      });
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", mv, { passive: true }); tick();
    return () => { removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  return (<div ref={ref} aria-label={text} style={{ display: "inline-block" }}>{Array.from(text).map((c, i) => <span key={i} aria-hidden="true" style={{ display: "inline-block", willChange: "transform", transition: "transform .12s linear" }}>{c}</span>)}</div>);
}
