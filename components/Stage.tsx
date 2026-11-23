"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useEffect, useMemo, useRef } from "react";
import { FL, S, emit, setFlavor } from "@/lib/store";
import { createCrispRazzlLabel } from "@/lib/label";

useGLTF.preload("/models/bottle.glb");
const damp = (a: number, b: number, k: number) => a + (b - a) * k;
const DEG = Math.PI / 180;

// Four spill cycles pinned by GSAP: rotation -18deg -> +115deg, then back. Flavour switches at the 75deg tip.
function homeAngle(p: number) {
  const x = Math.min(0.9999, Math.max(0, p)) * 4, c = Math.min(3, Math.floor(x)), q = x - c;
  const ang = q < 0.85 ? -18 + 133 * (q / 0.85) : 115 - 133 * ((q - 0.85) / 0.15);
  return { ang, flavor: Math.min(3, c + (q > 0.594 ? 1 : 0)) };
}

const softTex = () => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d")!, g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
};


// Custom WebGL atmosphere: domain-warped noise in the flavour colours, pointer-reactive. The CSS gradient (#amb) stays as the no-WebGL fallback.
const atmV = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }`;
const atmF = `uniform float t; uniform vec2 m; uniform vec3 c1; uniform vec3 c2; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1.0,0.0)), f.x), mix(h(i+vec2(0.0,1.0)), h(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<5;i++){ v += a*n(p); p *= 2.02; a *= 0.5; } return v; }
void main(){
  vec2 uv = vUv; vec2 p = uv*vec2(1.7,1.0) + vec2(0.0, t*0.02);
  vec2 q = vec2(fbm(p + vec2(0.0, t*0.05)), fbm(p + vec2(5.2,1.3) - t*0.04));
  float f = fbm(p + 1.1*q + m*0.2);
  vec3 base = vec3(0.025,0.02,0.04);
  vec3 brandRed = vec3(0.89, 0.055, 0.12);
  vec3 brandOrange = vec3(1.0, 0.32, 0.0);
  vec3 brandGreen = vec3(0.0, 0.65, 0.31);
  vec3 brandYellow = vec3(1.0, 0.88, 0.0);
  vec3 campaign = mix(brandRed, brandOrange, smoothstep(0.04, 0.62, uv.x));
  campaign = mix(campaign, brandGreen, smoothstep(0.52, 1.0, uv.y) * 0.22);
  campaign = mix(campaign, brandYellow, smoothstep(0.25, 0.82, uv.x) * 0.18);
  vec3 flavourTint = mix(c1, c2, smoothstep(0.18,0.9,uv.x));
  vec3 tint = mix(campaign, flavourTint, 0.68);
  vec3 col = mix(base, tint*0.82, smoothstep(0.34,0.86,f) * (1.0 - uv.y*0.38) * 0.72);
  col *= mix(0.45, 1.0, smoothstep(1.15, 0.25, length(uv-0.5)));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
function Atmosphere() {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: atmV, fragmentShader: atmF, depthTest: false, depthWrite: false, uniforms: { t: { value: 0 }, m: { value: new THREE.Vector2() }, c1: { value: new THREE.Color(FL[0].hex) }, c2: { value: new THREE.Color(FL[0].hex2) } } }), []);
  const a = useMemo(() => new THREE.Color(), []);
  useFrame((st) => {
    mat.uniforms.t.value = st.clock.elapsedTime; mat.uniforms.m.value.lerp(st.pointer, 0.04);
    mat.uniforms.c1.value.lerp(a.set(FL[S.flavor].hex), 0.04); mat.uniforms.c2.value.lerp(a.set(FL[S.flavor].hex2), 0.04);
  });
  return (<mesh renderOrder={-100} frustumCulled={false}><planeGeometry args={[2, 2]} /><primitive object={mat} attach="material" /></mesh>);
}

function Bottle() {
  const g = useRef<THREE.Group>(null!), mesh = useRef<THREE.Mesh>(null!), mouth = useRef<THREE.Object3D>(null!);
  const { gl, scene } = useThree();
  const flavorMotion = useRef({ last: -1, mode: "idle" as "idle" | "out" | "in", pending: 0, outDir: 1, inDir: 1, omega: 0, rotY: 0, rotTarget: 0 });
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    return () => { scene.environment = null; environment.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  const gl: any = useGLTF("/models/bottle.glb");
  const geo = useMemo(() => { let m: any; gl.scene.traverse((o: any) => { if (o.isMesh && !m) m = o; }); return m.geometry as THREE.BufferGeometry; }, []);
  const labels = useMemo(() => FL.map((f) => createCrispRazzlLabel(f.key)), []);
  const cols = useMemo(() => ({ liq: new THREE.Color(), cap: new THREE.Color() }), []);
  const appliedFlavor = useRef(-1);
  const uni = useMemo(() => ({ uLab: { value: labels[0] }, uLiq: { value: cols.liq }, uCap: { value: cols.cap },
    uFill: { value: 0.33 }, uCapY: { value: 0.4 }, uLab0: { value: 0.0 }, uLab1: { value: 0.19 } }), []);
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ roughness: 0.19, metalness: 0.015, clearcoat: 0.88, clearcoatRoughness: 0.12, envMapIntensity: 0.9, transparent: true });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vObj;\nuniform sampler2D uLab;\nuniform vec3 uLiq;\nuniform vec3 uCap;\nuniform float uFill;\nuniform float uCapY;\nuniform float uLab0;\nuniform float uLab1;")
        .replace("#include <color_fragment>", `#include <color_fragment>
          float ang = atan(vObj.x, vObj.z) / 6.28318530718 + 0.5;
          float lv = (vObj.y - uLab0) / (uLab1 - uLab0);
          vec3 base = uLiq; float al = 1.0;
          if (vObj.y > uFill) { base = vec3(0.86, 0.93, 0.96); al = 0.32; }
          if (vObj.y > uCapY) { base = uCap; al = 1.0; }
          else if (lv > 0.0 && lv < 1.0) { base = texture2D(uLab, vec2(ang, lv)).rgb; al = 1.0; }
          diffuseColor = vec4(base, al);`)
        .replace("#include <opaque_fragment>", `float fr = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
          outgoingLight += fr * vec3(0.32);
          #include <opaque_fragment>`);
    };
    return m;
  }, []);

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime, asp = st.size.width / st.size.height, mob = st.size.width < 800, route = S.route, halfW = 2.91 * asp;
    // Frame-rate independent easing keeps the model's motion consistent across devices.
    const ease = 1 - Math.exp(-dt * 7.5);
    const hideEase = 1 - Math.exp(-dt * 16);
    let tz = -0.1, tgt = { x: 0, y: 0, s: 1.15, show: 1 };
    if (route === "/") {
      const { ang, flavor } = S.p <= 0 ? { ang: -18, flavor: 0 } : homeAngle(S.p);
      tz = -ang * DEG; setFlavor(flavor);
      tgt = { x: mob ? 0 : Math.min(2.35, halfW * 0.55), y: mob ? 0.9 : 0, s: 1.1, show: S.show };
    } else if (route === "/flavours") tgt = { x: mob ? 0 : Math.min(2.2, halfW * 0.5), y: mob ? 0.8 : 0.1, s: 1.38, show: 1 };
    else tgt.show = 0;
    S.pop = Math.max(0, S.pop - dt * 0.9); tz -= Math.sin(S.pop * Math.PI) * 1.9;
    const G = g.current;
    G.rotation.z = damp(G.rotation.z, tz, ease);
    // A little more axial turn reveals the bottle's 3D shape; keep the idle bob restrained.
    const targetYaw = route === "/flavours" ? t * 0.28 + S.drag : t * 0.38 + Math.sin(t * 0.7) * 0.16 + S.mx * 0.28;
    const fi = S.flavor, motion = flavorMotion.current;
    const applyFlavour = (index: number) => {
      const f = FL[index];
      cols.liq.set(f.liq); cols.cap.set(f.cap); uni.uLab.value = labels[index];
      appliedFlavor.current = index; motion.last = index;
    };
    if (motion.last < 0) applyFlavour(fi);
    let targetX = tgt.x + Math.max(0, Math.abs(tz) - 0.3) * 0.25;
    if (route === "/flavours") {
      // TAG-style handoff: the current bottle accelerates off-screen, swaps flavour,
      // then the new bottle spins back in from the edge instead of simply recolouring.
      if (motion.mode === "idle" && fi !== motion.last) {
        motion.mode = "out"; motion.pending = fi;
        motion.outDir = G.position.x >= 0 ? 1 : -1;
        motion.omega = 3.8;
      }
      if (motion.mode === "out") {
        motion.pending = fi;
        targetX = motion.outDir * (halfW + 2.1);
        motion.omega = Math.min(12, motion.omega + 34 * dt);
        motion.rotY += motion.outDir * motion.omega * dt;
        if (Math.abs(G.position.x) > halfW + 1.25) {
          applyFlavour(motion.pending);
          // Desktop bottles enter from the side they will settle on; mobile alternates sides.
          motion.inDir = Math.abs(tgt.x) > 0.15 ? Math.sign(tgt.x) : -motion.outDir;
          G.position.x = motion.inDir * (halfW + 2.1);
          targetX = G.position.x;
          motion.rotTarget = motion.rotY + (motion.inDir > 0 ? -1 : 1) * Math.PI * 2;
          motion.mode = "in";
        }
      } else if (motion.mode === "in") {
        targetX = tgt.x;
        motion.rotY = damp(motion.rotY, motion.rotTarget, 1 - Math.exp(-dt * 5.5));
        if (Math.abs(G.position.x - tgt.x) < 0.12 && Math.abs(motion.rotTarget - motion.rotY) < 0.08) {
          motion.mode = "idle"; motion.rotY = 0;
        }
      } else {
        motion.rotY = damp(motion.rotY, 0, ease);
      }
    } else {
      // The homepage's scroll-driven pour still switches flavours at its original cue.
      if (appliedFlavor.current !== fi) applyFlavour(fi);
      motion.mode = "idle"; motion.rotY = damp(motion.rotY, 0, ease);
    }
    G.rotation.y = damp(G.rotation.y, targetYaw + motion.rotY, ease);
    G.rotation.x = damp(G.rotation.x, S.my * 7 * DEG, ease);
    G.rotation.z = damp(G.rotation.z, tz + (route === "/flavours" && motion.mode !== "idle" ? -motion.outDir * 0.10 : 0), ease);
    G.position.x = damp(G.position.x, targetX, 1 - Math.exp(-dt * (motion.mode === "out" ? 6.5 : motion.mode === "in" ? 5.5 : 7.5)));
    G.position.y = damp(G.position.y, tgt.y + Math.sin(t * 1.15) * 0.04, ease);
    const small = fi === 3 ? 0.9 : 1;
    const visibilityEase = tgt.show === 0 ? hideEase : ease;
    const sc = damp(G.scale.x, tgt.s * (mob ? 0.94 : 1) * 3.9 * tgt.show * small, visibilityEase);
    G.scale.setScalar(Math.max(0.0001, sc)); G.visible = sc > 0.02;
    S.bottlePos.copy(G.position); S.glow = damp(S.glow, tgt.show, visibilityEase);
    // The cap, liquid and label are updated together at the off-screen handoff.
    mouth.current.getWorldPosition(S.mouth); S.dir.set(0, 1, 0).applyQuaternion(G.quaternion);
    const on = Math.abs(G.rotation.z) > 75 * DEG && G.visible;
    if (on !== S.spillOn) { S.spillOn = on; emit(); }
  });
  return (
    <group ref={g} rotation={[0, 0, -18 * DEG]}>
      <mesh ref={mesh} geometry={geo} material={mat} />
      <object3D ref={mouth} position={[0, 0.5, 0]} />
    </group>
  );
}

// Ambient light pools behind the bottle, tinted by the active flavour.
function Glow() {
  const a = useRef<THREE.Mesh>(null!), b = useRef<THREE.Mesh>(null!), tex = useMemo(softTex, []), col = useMemo(() => new THREE.Color(), []);
  useFrame((st) => {
    const f = FL[S.flavor], t = st.clock.elapsedTime, p = S.bottlePos;
    for (const [m, sc, op, z, dy] of [[a.current, 10.5, 0.38, -1.5, -0.2], [b.current, 4.4, 0.3, -0.6, 0]] as any) {
      const mat = m.material as THREE.MeshBasicMaterial;
      m.position.set(p.x, p.y + dy, z); m.scale.setScalar(sc + Math.sin(t * 0.8) * 0.3);
      mat.color.lerp(col.set(f.hex), 0.08); mat.opacity = op * S.glow;
    }
  });
  return (<>
    <mesh ref={a}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <mesh ref={b}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
  </>);
}

// Large soft bokeh discs at different depths: ambient depth, not stars.
function Bokeh() {
  const N = 22, ref = useRef<THREE.InstancedMesh>(null!), tex = useMemo(softTex, []), d = useMemo(() => new THREE.Object3D(), []), c = useMemo(() => new THREE.Color(), []);
  const data = useMemo(() => Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 18, y: (Math.random() - 0.5) * 11, z: -4 + Math.random() * 6.5, s: 0.5 + Math.random() * 1.7, v: 0.0015 + Math.random() * 0.004, ph: Math.random() * 6.28 })), []);
  useFrame((st) => {
    const t = st.clock.elapsedTime, f = FL[S.flavor];
    data.forEach((o, i) => {
      o.y += o.v; if (o.y > 6.5) o.y = -6.5;
      d.position.set(o.x + Math.sin(t * 0.3 + o.ph) * 0.4, o.y, o.z); d.scale.setScalar(o.s * (1 + o.z * 0.05)); d.updateMatrix(); ref.current.setMatrixAt(i, d.matrix);
      c.set(i % 3 === 0 ? f.hex2 : f.hex).multiplyScalar(0.15 + (o.z + 4) * 0.025); ref.current.setColorAt(i, c);
    });
    ref.current.instanceMatrix.needsUpdate = true; if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (<instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></instancedMesh>);
}

function Splash() {
  const ref = useRef<THREE.InstancedMesh>(null!), N = 180, d = useMemo(() => new THREE.Object3D(), []);
  const p = useMemo(() => Array.from({ length: N }, () => ({ a: 0, l: 0, s: 0.06, pos: new THREE.Vector3(), v: new THREE.Vector3() })), []);
  const cur = useRef(0), col = useMemo(() => new THREE.Color(), []);
  const spawn = (pw: number) => {
    const o = p[cur.current++ % N]; o.a = 1; o.l = 0; o.s = 0.025 + Math.random() * 0.055;
    o.pos.copy(S.mouth); o.v.copy(S.dir).multiplyScalar((0.05 + Math.random() * 0.06) * pw);
    o.v.x += (Math.random() - 0.5) * 0.03; o.v.y += (Math.random() - 0.2) * 0.03; o.v.z += (Math.random() - 0.5) * 0.03;
  };
  useFrame((_, dt) => {
    if (S.spillOn) for (let i = 0; i < 3; i++) if (Math.random() < 0.7) spawn(1.2);
    if (S.burst > 0) { const n = Math.min(S.burst, 9); for (let i = 0; i < n; i++) spawn(1.5); S.burst -= n; }
    const m = ref.current;
    for (let i = 0; i < N; i++) {
      const o = p[i];
      if (o.a) {
        o.l += dt;
        const frameScale = Math.min(dt * 60, 2);
        o.v.y -= 0.0055 * frameScale;
        o.pos.addScaledVector(o.v, frameScale);
        if (o.l > 0.85) o.a = 0;
      }
      if (o.a) {
        d.position.copy(o.pos);
        const particleScale = (1 - o.l / 0.85) * o.s * 3;
        d.scale.set(particleScale, particleScale * 1.18, particleScale);
      } else { d.position.set(0, -60, 0); d.scale.setScalar(0.0001); }
      d.updateMatrix(); m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    (m.material as THREE.MeshStandardMaterial).color.lerp(col.set(FL[S.flavor].key === "cola" ? "#7a2a1c" : FL[S.flavor].liq), 0.1);
  });
  return (<instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial roughness={0.2} /></instancedMesh>);
}

const vert = `varying vec3 N; varying vec3 V;
void main(){ mat4 m = modelViewMatrix * instanceMatrix; vec4 mv = m * vec4(position,1.0); N = normalize(mat3(m) * normal); V = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const frag = `varying vec3 N; varying vec3 V;
void main(){
  float f = pow(1.0 - abs(dot(N,V)), 2.2);
  vec3 c = mix(vec3(0.72,0.82,0.92), vec3(1.0), f * 0.5);
  float h = pow(max(dot(N, normalize(vec3(0.4,0.7,0.6))), 0.0), 40.0);
  gl_FragColor = vec4(c*(f*0.32+0.08)+h*0.35, clamp(f*0.42+h*0.25+0.025, 0.0, 0.42));
}`;

function Bubbles() {
  const N = 30, ref = useRef<THREE.InstancedMesh>(null!), d = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 11, z: -1 + Math.random() * 2.5, v: 0.006 + Math.random() * 0.014, s: 0.1 + Math.random() * 0.42, ph: Math.random() * 6.28, vx: 0, vy: 0 })), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false }), []);
  useFrame((st) => {
    const t = st.clock.elapsedTime, hh = Math.tan(20 * DEG) * 8, hw = hh * (st.size.width / st.size.height), wx = st.pointer.x * hw, wy = st.pointer.y * hh;
    const boost = 1 + Math.abs(Math.sin(S.pop * Math.PI)) * 2.5;
    for (let i = 0; i < N; i++) {
      const b = data[i]; b.y += b.v * boost; if (b.y > 6.2) { b.y = -6.2; b.x = (Math.random() - 0.5) * 16; b.vx = b.vy = 0; }
      const sx = b.x + Math.sin(t * 1.1 + b.ph) * 0.35, dx = sx + b.vx - wx, dy = b.y + b.vy - wy, di = Math.hypot(dx, dy);
      if (di < 2) { const fo = (2 - di) * 0.03; b.vx += (dx / (di || 1)) * fo; b.vy += (dy / (di || 1)) * fo; }
      b.vx *= 0.94; b.vy *= 0.94;
      d.position.set(sx + b.vx, b.y + b.vy, b.z); d.scale.setScalar(b.s * (1 + Math.sin(t * 3 + b.ph) * 0.05)); d.updateMatrix(); ref.current.setMatrixAt(i, d.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (<instancedMesh ref={ref} args={[undefined, mat, N]} frustumCulled={false}><sphereGeometry args={[1, 28, 20]} /></instancedMesh>);
}

function Lights() {
  const rim = useRef<THREE.DirectionalLight>(null!), c = useMemo(() => new THREE.Color(), []);
  useFrame(() => { rim.current.color.lerp(c.set(FL[S.flavor].hex), 0.08); });
  return (<><ambientLight intensity={1.0} /><directionalLight position={[4, 6, 6]} intensity={1.5} /><directionalLight ref={rim} position={[-5, 2, -4]} intensity={2.4} /></>);
}

export default function Stage() {
  useEffect(() => {
    const mm = (e: PointerEvent) => { S.mx = (e.clientX / innerWidth) * 2 - 1; S.my = -((e.clientY / innerHeight) * 2 - 1); };
    let down = false, dragging = false, lx = 0, ly = 0;
    const pd = (e: PointerEvent) => {
      if (S.route === "/flavours" && (e.target as HTMLElement).closest("[data-drag]")) {
        down = true; dragging = false; lx = e.clientX; ly = e.clientY;
      }
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (!dragging && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.25) dragging = true;
      if (dragging) S.drag += dx * 0.012;
      lx = e.clientX; ly = e.clientY;
    };
    const pu = () => { down = false; dragging = false; };
    addEventListener("pointermove", mm);
    addEventListener("pointerdown", pd);
    addEventListener("pointermove", pm);
    addEventListener("pointerup", pu);
    addEventListener("pointercancel", pu);
    return () => {
      removeEventListener("pointermove", mm);
      removeEventListener("pointerdown", pd);
      removeEventListener("pointermove", pm);
      removeEventListener("pointerup", pu);
      removeEventListener("pointercancel", pu);
    };
  }, []);
  return (
    <Canvas flat dpr={[1, 1.75]} camera={{ fov: 40, position: [0, 0, 8] }} gl={{ alpha: true, antialias: true }}
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} eventSource={typeof document !== "undefined" ? document.body : undefined}>
      <Atmosphere /><Lights /><Glow /><Bokeh /><Bubbles /><Bottle /><Splash />
    </Canvas>
  );
}
