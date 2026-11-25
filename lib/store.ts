import * as THREE from "three";

export type Flavor = {
  key: "cola" | "orange" | "lemon" | "pamplemousse";
  name: string; hex: string; hex2: string; ink: string; outline: string;
  liq: string; cap: string; size: string; kcal: string; sugar: string;
  line: string; desc: string;
};

// Colours and facts follow the brief: Cola red, Orange, Lemon green, Pamplemousse canary yellow (40cl, forest-green cap).
export const FL: Flavor[] = [
  { key: "cola", name: "Cola", hex: "#D91A2A", hex2: "#5b0a4a", ink: "#ffffff", outline: "#2a0509", liq: "#1b0a07", cap: "#D91A2A", size: "60cl", kcal: "36.4 kcal / 100ml", sugar: "8.9 g sugar",
    line: "Where I go, things get good.", desc: "The classic, unforgettable taste of cola. Great on the go and in cocktails." },
  { key: "orange", name: "Orange", hex: "#FF6B00", hex2: "#a3002e", ink: "#1a0a00", outline: "#fff1de", liq: "#ff7a00", cap: "#FF8A2A", size: "60cl", kcal: "27 kcal / 100ml", sugar: "8.5 g sugar",
    line: "Smooth, sweet, easy on you.", desc: "A delicate balance of orange with a smooth, sweet aftertaste. Easy on the mouth and stomach, great for a hot afternoon." },
  { key: "lemon", name: "Lemon", hex: "#009640", hex2: "#03486f", ink: "#ffffff", outline: "#02220f", liq: "#d9f2e0", cap: "#1FB455", size: "60cl", kcal: "36.4 kcal / 100ml", sugar: "8.9 g sugar",
    line: "A bubbly mouthful that sizzles.", desc: "Light and fun, the taste explodes as it sizzles. Also a great mixer for evening parties." },
  { key: "pamplemousse", name: "Pamplemousse", hex: "#F7D617", hex2: "#c24a12", ink: "#1b0f3a", outline: "#fff9d6", liq: "#f2dd5a", cap: "#1B8A3D", size: "40cl", kcal: "36.4 kcal / 100ml", sugar: "8.9 g sugar",
    line: "The one that is only Razzl.", desc: "Our most unique flavour, made with 8% grapefruit juice. Sweet and refreshing, with a twang you remember as the bubbles burst." },
];

// Mutable animation state shared between the DOM (GSAP) and the persistent WebGL stage.
export const S: any = {
  route: "/", flavor: 0, p: 0, act1: 0, show: 0, pop: 0, burst: 0,
  mx: 0, my: 0, drag: 0, size60: true, spillOn: false,
  mouth: new THREE.Vector3(), bottlePos: new THREE.Vector3(), glow: 1, dir: new THREE.Vector3(0, 1, 0),
  listeners: new Set<() => void>(), go: null as null | ((href: string) => void),
};

export const emit = () => S.listeners.forEach((f: any) => f());

export function setFlavor(i: number, burst = false) {
  if (i === S.flavor) return;
  S.flavor = i;
  if (burst) S.burst = 45;
  if (typeof document !== "undefined") {
    const f = FL[i], r = document.documentElement.style;
    r.setProperty("--fl", f.hex); r.setProperty("--fl2", f.hex2); r.setProperty("--ink", f.ink); r.setProperty("--ou", f.outline);
  }
  emit();
}
