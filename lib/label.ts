import * as THREE from "three";

// 2048x512 label generator, following the brief's themes (Pamplemousse yellow with green script, Cola red, Orange, Lemon green).
// Stand-in wordmark until the official Razzl logo file is supplied.
export function createCrispRazzlLabel(flavor: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048; canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const themes: any = {
    pamplemousse: { bg: "#F7D617", dot: "rgba(255,255,255,0.35)", fill: "#1B8A3D", stroke: "#FFFFFF", sub: "Pamplemousse", subColor: "#115726", banner: "#1B8A3D", bannerText: "CARBONATED GRAPEFRUIT DRINK", volume: "40cl" },
    cola: { bg: "#D91A2A", dot: "rgba(255,255,255,0.22)", fill: "#FFFFFF", stroke: "#7A0912", sub: "Cola", subColor: "#FFFFFF", banner: "#7A0912", bannerText: "CARBONATED SOFT DRINK", volume: "60cl" },
    orange: { bg: "#FF6B00", dot: "rgba(255,230,120,0.3)", fill: "#FFFFFF", stroke: "#1A1A1A", sub: "Orange", subColor: "#1A1A1A", banner: "#1A1A1A", bannerText: "CARBONATED ORANGE DRINK", volume: "60cl" },
    lemon: { bg: "#009640", dot: "rgba(180,255,200,0.25)", fill: "#33D1FF", stroke: "#FFFFFF", sub: "Lemon", subColor: "#FFFFFF", banner: "#005A26", bannerText: "CARBONATED LEMON DRINK", volume: "60cl" },
  };
  const t = themes[flavor] || themes.pamplemousse;
  ctx.fillStyle = t.bg; ctx.fillRect(0, 0, 2048, 512);
  ctx.fillStyle = t.dot;
  for (let x = 720; x < 1340; x += 28) for (let y = 70; y < 440; y += 28) {
    const r = Math.max(0, 11 - Math.hypot(x - 1024, y - 256) * 0.028);
    if (r > 0.5) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.save(); ctx.translate(1024, 230); ctx.rotate(-0.07);
  ctx.font = 'italic 900 175px "Arial Black", Impact, sans-serif';
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 22; ctx.lineJoin = "round"; ctx.strokeStyle = t.stroke; ctx.strokeText("Razzl", 0, 0);
  ctx.fillStyle = t.fill; ctx.fillText("Razzl", 0, 0);
  ctx.font = "italic 700 62px Georgia, serif"; ctx.fillStyle = t.subColor; ctx.fillText(t.sub, 10, 108);
  ctx.restore();
  if (flavor === "pamplemousse") { // grapefruit halves beside the wordmark
    for (const [cx, cy] of [[1330, 190], [1385, 270]]) {
      ctx.fillStyle = "#B7D43A"; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, 7); ctx.fill();
      ctx.fillStyle = "#F7E76A"; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 7); ctx.fill();
    }
  }
  ctx.fillStyle = t.banner; ctx.fillRect(790, 395, 470, 44);
  ctx.fillStyle = "#FFFFFF"; ctx.font = "700 22px Arial, sans-serif"; ctx.textAlign = "center"; ctx.fillText(t.bannerText, 1025, 424);
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(670, 385, 85, 52);
  ctx.fillStyle = "#111111"; ctx.font = "900 28px Arial, sans-serif"; ctx.fillText(t.volume, 712, 421);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16; tex.needsUpdate = true;
  return tex;
}
