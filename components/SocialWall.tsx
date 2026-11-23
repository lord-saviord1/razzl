"use client";
import { useEffect } from "react";
import { INSTAGRAM_URLS, LINKS, POSTS, TIKTOK_URLS } from "@/lib/social";

function loadScript(src: string, id: string, done?: () => void) {
  const old = document.getElementById(id);
  if (old) { done && done(); return; }
  const s = document.createElement("script"); s.id = id; s.src = src; s.async = true; s.onload = () => done && done(); document.body.appendChild(s);
}

export default function SocialWall() {
  useEffect(() => {
    if (INSTAGRAM_URLS.length) loadScript("https://www.instagram.com/embed.js", "ig-embed", () => (window as any).instgrm?.Embeds.process());
    if (TIKTOK_URLS.length) loadScript("https://www.tiktok.com/embed.js", "tt-embed");
  }, []);
  return (
    <>
      <div className="wall">
        {POSTS.map((p, k) => (
          <a key={p.img} className="post glass" href={p.url || LINKS.instagram} target="_blank" rel="noopener noreferrer" data-cursor="VIEW" style={{ transform: `rotate(${[-2, 1.5, -1, 2, -2.5, 1][k]}deg)` }}>
            <img src={p.img} alt={p.caption} loading="lazy" />
            <div className="cap"><span className="tag">{p.tag}</span><p>{p.caption}</p>{p.date && <small>{p.date}</small>}</div>
          </a>))}
      </div>
      {(INSTAGRAM_URLS.length > 0 || TIKTOK_URLS.length > 0) && (
        <div className="embeds">
          {INSTAGRAM_URLS.map((u) => (<blockquote key={u} className="instagram-media" data-instgrm-permalink={u} data-instgrm-version="14" style={{ background: "#fff", maxWidth: 400, width: "100%" }} />))}
          {TIKTOK_URLS.map((u) => (<blockquote key={u} className="tiktok-embed" cite={u} data-video-id={u.split("/").pop()} style={{ maxWidth: 400, minWidth: 280 }}><section /></blockquote>))}
        </div>)}
    </>
  );
}
