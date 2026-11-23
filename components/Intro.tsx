"use client";
import { useEffect, useState } from "react";

const BOTTLE = (f: number) => [
  f ? "      °   ·  " : "     ·   °   ",
  f ? "    ·    °    " : "   °    ·     ",
  "      ┌─┐      ",
  "      │ │      ",
  "     ╭┘ └╮     ",
  "     │▒▒▒▒│    ",
  "     │ Rz │    ",
  "     │▒▒▒▒│    ",
  "     │    │    ",
  "     ╰────╯    ",
].join("\n");

// ASCII boot intro: plays once per browsing session, skippable (button, Enter, Esc, click).
export default function Intro() {
  const [pct, setPct] = useState(0), [out, setOut] = useState(false), [gone, setGone] = useState(false), [f, setF] = useState(0);
  const skip = () => { setPct(100); setOut(true); setTimeout(() => setGone(true), 600); };
  useEffect(() => {
    if (document.documentElement.classList.contains("no-intro")) { setGone(true); return; }
    try { sessionStorage.setItem("razzl-intro", "1"); } catch (e) {}
    document.body.style.overflow = "hidden";
    const t0 = performance.now(), dur = 2800;
    const id = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / dur); setPct(Math.round((1 - Math.pow(1 - k, 2.2)) * 100)); setF((x) => 1 - x); if (k >= 1) { clearInterval(id); skip(); } }, 120);
    const key = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === "Escape") skip(); };
    addEventListener("keydown", key);
    return () => { clearInterval(id); removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, []);
  useEffect(() => { if (gone) document.body.style.overflow = ""; }, [gone]);
  if (gone) return null;
  return (
    <div id="intro" className={out ? "out" : ""} onClick={skip} role="dialog" aria-label="Loading intro">
      <pre className="ascii" aria-hidden="true">{BOTTLE(f)}</pre>
      <div className="term">
        <div>$ razzl --boot</div>
        <div>&gt; chilling the bottles <span className="dots">........</span> {pct}%</div>
        <div>&gt; pouring: cola · orange · lemon · pamplemousse</div>
        <div className="bar"><i style={{ width: pct + "%" }} /></div>
      </div>
      <button className="skip" onClick={(e) => { e.stopPropagation(); skip(); }}>Skip →</button>
    </div>
  );
}
