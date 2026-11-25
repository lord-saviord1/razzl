"use client";
import { useEffect, useState } from "react";

// A short branded loading moment, shown once per browsing session and always skippable.
export default function Intro() {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const skip = () => { setPct(100); setOut(true); setTimeout(() => setGone(true), 550); };

  useEffect(() => {
    if (document.documentElement.classList.contains("no-intro")) { setGone(true); return; }
    try { sessionStorage.setItem("razzl-intro", "1"); } catch (e) {}
    document.body.style.overflow = "hidden";
    const t0 = performance.now(), dur = 1700;
    const id = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / dur);
      setPct(Math.round((1 - Math.pow(1 - k, 2.2)) * 100));
      if (k >= 1) { clearInterval(id); skip(); }
    }, 100);
    const key = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === "Escape") skip(); };
    addEventListener("keydown", key);
    return () => { clearInterval(id); removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, []);
  useEffect(() => { if (gone) document.body.style.overflow = ""; }, [gone]);
  if (gone) return null;
  return (
    <div id="intro" className={out ? "out" : ""} onClick={skip} role="dialog" aria-label="Razzl loading intro">
      <div className="intro-mark" aria-hidden="true"><span>R</span><i /><b /></div>
      <div className="intro-wordmark">Razzl</div>
      <div className="intro-caption">Your world is getting ready.</div>
      <div className="intro-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: pct + "%" }} />
      </div>
      <button className="skip" onClick={(e) => { e.stopPropagation(); skip(); }}>Skip intro</button>
    </div>
  );
}
