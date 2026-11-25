"use client";
import { CHARACTERS } from "@/lib/characters";
import { FL } from "@/lib/store";

export default function About() {
  return (
    <main className="page">
      <span className="eyebrow">About Razzl</span>
      <h1 className="display o-l">Our brand</h1>
      <p className="lead serif o-l">Fresh, youthful, vibrant, dynamic, bubbly and expressive.</p>
      <p className="section-intro">A drink brand built around flavour, personality and the freedom to show up as yourself.</p>
      <p>We support the aspirations of the youth of Nigeria, and their desire for self-expression and to be heard. Razzl is for those who are youthful in body or mind, go-getters aspiring to better their lives, energetic, dynamic people full of the youthful joy of life.</p>
      <div className="chips" style={{ marginTop: 20 }}>{["Bright", "Bubbly", "Colourful", "Fresh", "Modern", "Explosive", "Young"].map((w) => <span key={w} className="chip">{w}</span>)}</div>
      <div className="grid">
        <div className="glass card"><b>Mission</b><p>To become a leading brand in the Nigerian beverage industry.</p></div>
        <div className="glass card"><b>Vision</b><p>To become a total future beverages company across the African continent.</p></div>
        <div className="glass card"><b>The shield</b><p>The shield design communicates stability, protection through quality ingredients and production, longevity and confidence. It is composed of simple square pixels arranged in the shape of a shield, flowing away to the top left to denote movement, like bubbles in a bottle.</p></div>
      </div>
      <h2 className="display o-l">What’s your Razzl?</h2>
      <p>There’s a Razzl for everyone. Four characters, four flavours.</p>
      <div className="grid">{FL.map((f) => (
        <div key={f.key} className="glass card" style={{ borderColor: f.hex, boxShadow: `0 30px 60px -30px ${f.hex}` }}>
          <b className="o-l">{CHARACTERS[f.key].name}</b><span className="chip" style={{ background: f.hex, color: f.ink, borderColor: f.hex }}>{f.name}</span><p style={{ marginTop: 12 }}>{CHARACTERS[f.key].bio}</p>
        </div>))}</div>
      <div className="links"><a href="https://www.drinkrazzl.com/calculator/" target="_blank" rel="noopener noreferrer">Take the Razzl Calculator quiz</a></div>
    </main>
  );
}
