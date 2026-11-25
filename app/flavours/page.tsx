"use client";
import { FL, setFlavor } from "@/lib/store";
import { useFlavor } from "@/components/Shell";
import { CHARACTERS } from "@/lib/characters";

export default function Lineup() {
  const { f, i } = useFlavor();
  const c = CHARACTERS[f.key];
  const isLongName = f.name.length >= 10;
  return (
    <main className="page flavour-page" data-drag style={{ touchAction: "pan-y" }}>
      <div className="flavour-copy" style={{ width: "100%", maxWidth: 680, minWidth: 0 }}>
        <span className="eyebrow">Flavours</span>
        <h1
          className="display o-l"
          style={isLongName ? { fontSize: "clamp(30px, 5vw, 64px)", letterSpacing: "-0.035em", width: "100%", maxWidth: "100%", whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.02 } : { maxWidth: "100%", lineHeight: 1.02 }}
        >
          {f.name}
        </h1>
        <p className="lead serif o-l">{f.line}</p>
        <p>{f.desc}</p>
        <div className="chips" style={{ margin: "18px 0" }}><span className="chip">{f.size}</span><span className="chip">{f.kcal}</span><span className="chip">{f.sugar}</span>{i === 3 && <span className="chip">8% grapefruit juice</span>}</div>
        <div className="chips">{FL.map((x, k) => (<button key={x.key} className="btn ghost" style={k === i ? { background: "#fff", color: "#07050d" } : {}} onClick={() => setFlavor(k)}>{x.name}</button>))}</div>
        <div className="glass card" style={{ marginTop: 26 }}><b>{c.name}</b><p>{c.bio}</p></div>
      </div>
    </main>
  );
}
