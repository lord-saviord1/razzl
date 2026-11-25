"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FL, S } from "@/lib/store";
import { CHARACTERS } from "@/lib/characters";
import { RLink, useFlavor } from "@/components/Shell";
import { LINKS } from "@/lib/social";
import Letters from "@/components/Letters";

export default function Home() {
  const { f, i, spill } = useFlavor();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Keep the opening hero clear for the real Razzl product photograph.
    // Reveal the existing 3D bottle as the pinned flavour experience enters.
    S.p = 0; S.show = 0;
    const ctx = gsap.context(() => {
      // Pinned, scrubbed tilt and spill: four flavours, one pour each
      gsap.to(S, { p: 1, ease: "none", scrollTrigger: { trigger: "#act2", start: "top top", end: "+=450%", pin: true, scrub: 1.2 } });
      ScrollTrigger.create({
        trigger: "#act2",
        start: "top top",
        onEnter: () => { S.show = 1; },
        onEnterBack: () => { S.show = 1; },
        onLeaveBack: () => { S.show = 0; }
      });
      ScrollTrigger.create({ trigger: "#after", start: "top 70%", onEnter: () => { S.show = 0; }, onLeaveBack: () => { S.show = 1; } });
    });
    return () => ctx.revert();
  }, []);
  return (
    <main>
      <section id="hero" className="act hero">
        <span className="eyebrow">Fresh · Youthful · Bubbly</span>
        <div className="wm"><Letters text="Razzl" /></div>
        <p className="sub serif o-l">Your World! Explore our refreshing variants.</p>
        <div className="chips" style={{ marginBottom: 6 }}>
          <RLink href="/flavours" className="btn mag">Explore flavours</RLink>
          <RLink href="/culture" className="btn ghost mag">See the culture</RLink>
        </div>
      </section>

      <section id="act2" className="act">
        <div className={"story" + (spill ? " on" : "")}><span className="o-l">Crisp. Tart. Unapologetic.</span></div>
        <div className="panel glass">
          <span className="eyebrow">Tilt &amp; spill · {i + 1}/4</span>
          <h2 className="o-l">{f.name}</h2>
          <div className="tl serif o-l">{f.line}</div>
          <p>{f.desc}</p>
          <div className="chips"><span className="chip">{f.size}</span><span className="chip">{f.kcal}</span><span className="chip">{f.sugar}</span></div>
          <button className="btn mag" style={{ marginTop: 16 }} onClick={() => { S.pop = 1; S.burst = 30; }}>Shake it</button>
        </div>
      </section>

      <div id="after">
        <section className="sec">
          <div className="split">
            <div>
              <span className="eyebrow">All hail the Razzl-Boss</span>
              <h2 className="display o-l" style={{ margin: "18px 0 14px" }}>The Razzl-Boss is here</h2>
              <p>The 60cl Boss Size is out with 20% extra, and the Razzl-Boss trucks are on the move, bringing games, prizes, exclusive merch, music and drinks straight to campuses, parks and markets. The Unleash the Boss challenge asks creators to show off their skills to the Razzl jingle with a 60cl bottle in the shot.</p>
              <div className="chips" style={{ margin: "18px 0" }}>{["#UnleashTheBoss", "#TheRazzlBoss", "60cl Boss Size", "20% extra"].map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              <RLink href="/culture" className="btn mag">See what’s happening</RLink>
            </div>
            <div className="glass card"><b>Razzl-Boss on the move</b><p>Campuses, parks and markets close to you. Follow @drinkrazzl_ng for where the trucks stop next.</p><div className="links"><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><a href={LINKS.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a></div></div>
          </div>
        </section>

        <section className="sec">
          <span className="eyebrow">What’s your Razzl?</span>
          <h2 className="display o-l">There’s a Razzl for everyone</h2>
          <div className="grid">
            {FL.map((x) => (
              <div key={x.key} className="glass card" style={{ borderColor: x.hex, boxShadow: `0 30px 60px -30px ${x.hex}` }}>
                <b className="o-l">{CHARACTERS[x.key].name}</b>
                <span className="chip" style={{ background: x.hex, color: x.ink, borderColor: x.hex }}>{x.name}</span>
                <p style={{ marginTop: 12 }}>{CHARACTERS[x.key].bio}</p>
              </div>))}
          </div>
          <div className="links"><a href="https://www.drinkrazzl.com/calculator/" target="_blank" rel="noopener noreferrer">Take the Razzl Calculator quiz</a><RLink href="/about">About Razzl</RLink></div>
        </section>
      </div>
    </main>
  );
}
