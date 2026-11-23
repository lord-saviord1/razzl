"use client";
import { FL, S, setFlavor } from "@/lib/store";
import { useFlavor } from "@/components/Shell";
import { CHARACTERS } from "@/lib/characters";

export default function Lineup() {
  const { f, i } = useFlavor();
  const c = CHARACTERS[f.key];
  return (
    <main className="page" data-drag style={{ touchAction: "pan-y" }}>
      <div style={{ maxWidth: 520 }}>
        <span className="eyebrow">Flavours</span>
        <h1 className="display o-l">{f.name}</h1>
        <p className="lead serif o-l">{f.line}</p>
        <p>{f.desc}</p>
        <div className="chips" style={{ margin: "18px 0" }}><span className="chip">{f.size}</span><span className="chip">{f.kcal}</span><span className="chip">{f.sugar}</span>{i === 3 && <span className="chip">8% grapefruit juice</span>}</div>
        <div className="chips">{FL.map((x, k) => (<button key={x.key} className="btn ghost" style={k === i ? { background: "#fff", color: "#07050d" } : {}} onClick={() => setFlavor(k)}>{x.name}</button>))}</div>
        <div style={{ marginTop: 18 }}><button className="btn mag" onClick={() => { S.pop = 1; S.burst = 45; }}>Shake it</button></div>
        <p style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>Drag to spin the bottle.</p>
        <div className="glass card" style={{ marginTop: 26 }}><b>{c.name}</b><p>{c.bio}</p></div>
      </div>
    </main>
  );
}
