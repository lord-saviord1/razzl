"use client";
import SocialWall from "@/components/SocialWall";
import { HIGHLIGHTS, LINKS, UTB_TAGS } from "@/lib/social";

export default function Culture() {
  return (
    <main className="page">
      <span className="eyebrow">Culture</span>
      <h1 className="display o-l">Razzl<br />socials</h1>
      <p className="lead serif o-l">What the brand is posting right now.</p>

      <section className="glass promo">
        <div>
          <span className="eyebrow">Razzl-Boss 60cl</span>
          <h2 className="display o-l" style={{ margin: "16px 0 12px", fontSize: "clamp(36px,6vw,84px)" }}>Unleash the Boss</h2>
          <p>Film yourself showing off your skills to the Razzl jingle, with a 60cl bottle in the shot. Post it on Instagram or TikTok, follow and tag @drinkrazzl_ng, and use the hashtag that matches your talent.</p>
          <div className="chips" style={{ margin: "18px 0" }}>{UTB_TAGS.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          <div className="links"><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><a href={LINKS.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a></div>
        </div>
        <img className="promo-img" src="/social/boss-rules.jpg" alt="How to enter the Unleash the Boss challenge" loading="lazy" />
      </section>

      <section className="glass promo" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <span className="eyebrow">All hail the Razzl-Boss</span>
          <h2 className="display o-l" style={{ margin: "16px 0 12px", fontSize: "clamp(36px,6vw,84px)" }}>On the move</h2>
          <p>The Razzl-Boss trucks are bringing the vibe and excitement straight to campuses, parks and markets close to you. Games, prizes, exclusive merch, music, drinks and non-stop fun.</p>
          <div className="chips" style={{ margin: "18px 0 0" }}>{HIGHLIGHTS.map((h) => <span key={h} className="chip">{h}</span>)}<span className="chip">60cl Boss Size · 20% extra</span></div>
        </div>
      </section>

      <h2 className="display o-l">From the feed</h2>
      <SocialWall />
    </main>
  );
}
