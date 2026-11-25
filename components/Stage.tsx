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

// Soft particle texture used by the bottle lighting and splash layer.
const softTex = () => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d")!, g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
};


// Original two-pass GPU water simulation, adapted to the existing R3F renderer.
// Pointer movement injects pressure into the simulation; it never warps the page or camera.
const simulationVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const simulationFragmentShader = `
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
varying vec2 vUv;
const float delta = 1.4;
void main() {
    vec2 uv = vUv;
    if (frame == 0) { gl_FragColor = vec4(0.0); return; }
    vec4 data = texture2D(textureA, uv);
    float pressure = data.x;
    float pVel = data.y;
    vec2 texelSize = 1.0 / resolution;
    float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
    float p_left = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
    float p_up = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
    float p_down = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;
    if (uv.x <= texelSize.x) p_left = p_right;
    if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
    if (uv.y <= texelSize.y) p_down = p_up;
    if (uv.y >= 1.0 - texelSize.y) p_up = p_down;
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;
    pressure += delta * pVel;
    pVel -= 0.005 * delta * pressure;
    pVel *= 1.0 - 0.002 * delta;
    pressure *= 0.999;
    vec2 mouseUV = mouse / resolution;
    if (mouse.x > 0.0) {
        float dist = distance(uv, mouseUV);
        if (dist <= 0.02) pressure += 2.0 * (1.0 - dist / 0.02);
    }
    gl_FragColor = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);
}
`;
const renderVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const renderFragmentShader = `
uniform sampler2D textureA;
uniform sampler2D textureB;
varying vec2 vUv;
void main() {
    vec4 data = texture2D(textureA, vUv);
    vec2 distortion = 0.3 * data.zw;
    vec4 color = texture2D(textureB, vUv + distortion);
    vec3 normal = normalize(vec3(-data.z * 2.0, 0.5, -data.w * 2.0));
    vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));
    float specular = pow(max(0.0, dot(normal, lightDir)), 60.0) * 1.5;
    gl_FragColor = color + vec4(specular);
}
`;

function Atmosphere() {
  const { gl, size, pointer, scene, camera } = useThree();
  const simScene = useMemo(() => new THREE.Scene(), []);
  const bgScene = useMemo(() => new THREE.Scene(), []);
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const simMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      textureA: { value: null }, mouse: { value: new THREE.Vector2() },
      resolution: { value: new THREE.Vector2(1, 1) }, time: { value: 0 }, frame: { value: 0 },
    },
    vertexShader: simulationVertexShader, fragmentShader: simulationFragmentShader,
  }), []);
  const renderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { textureA: { value: null }, textureB: { value: null } },
    vertexShader: renderVertexShader, fragmentShader: renderFragmentShader,
    depthTest: false, depthWrite: false,
  }), []);
  const simQuad = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial), [simMaterial]);
  const bgQuad = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2), renderMaterial), [renderMaterial]);
  const background = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    const paint = (time: number) => {
      ctx.fillStyle = "#FBF7EF"; ctx.fillRect(0, 0, 512, 512);
      const blobs = [
        ["#DDE5B0", 105 + Math.sin(time * .12) * 55, 110 + Math.cos(time * .10) * 38, 330],
        ["#E4D8EA", 390 + Math.cos(time * .09) * 48, 115 + Math.sin(time * .13) * 42, 310],
        ["#FBE3D9", 360 + Math.sin(time * .08) * 42, 390 + Math.cos(time * .11) * 35, 320],
        ["#D5EDF9", 100 + Math.cos(time * .10) * 38, 390 + Math.sin(time * .09) * 40, 300],
        ["#FDD835", 255 + Math.sin(time * .07) * 70, 245 + Math.cos(time * .08) * 50, 185],
        ["#E2552B", 440 + Math.sin(time * .06) * 20, 300 + Math.cos(time * .07) * 35, 125],
        ["#A0B043", 65 + Math.cos(time * .06) * 24, 235 + Math.sin(time * .08) * 35, 145],
      ] as const;
      for (const [color, x, y, radius] of blobs) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color); gradient.addColorStop(.58, color + "B8");
        gradient.addColorStop(1, "rgba(251,247,239,0)");
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512);
      }
      tex.needsUpdate = true;
    };
    paint(0);
    return { tex, paint };
  }, []);
  const targets = useRef<{ a: THREE.WebGLRenderTarget; b: THREE.WebGLRenderTarget } | null>(null);
  const frame = useRef(0);
  const pixelRatio = Math.min(gl.getPixelRatio(), 1.5);
  useEffect(() => {
    const w = Math.max(1, Math.floor(size.width * pixelRatio));
    const h = Math.max(1, Math.floor(size.height * pixelRatio));
    const options: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat, type: THREE.FloatType,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      stencilBuffer: false, depthBuffer: false,
    };
    const a = new THREE.WebGLRenderTarget(w, h, options);
    const b = new THREE.WebGLRenderTarget(w, h, options);
    targets.current = { a, b };
    simMaterial.uniforms.resolution.value.set(w, h);
    frame.current = 0;
    return () => { a.dispose(); b.dispose(); targets.current = null; };
  }, [gl, size.width, size.height, pixelRatio, simMaterial]);
  useEffect(() => {
    simScene.add(simQuad); bgScene.add(bgQuad);
    return () => { simScene.remove(simQuad); bgScene.remove(bgQuad); };
  }, [simScene, bgScene, simQuad, bgQuad]);
  useEffect(() => () => {
    simMaterial.dispose(); renderMaterial.dispose();
    simQuad.geometry.dispose(); bgQuad.geometry.dispose(); background.tex.dispose();
  }, [simMaterial, renderMaterial, simQuad, bgQuad, background]);
  useFrame((state) => {
    const pair = targets.current;
    if (!pair) return;
    const w = pair.a.width, h = pair.a.height;
    simMaterial.uniforms.frame.value = frame.current++;
    simMaterial.uniforms.time.value = state.clock.elapsedTime;
    simMaterial.uniforms.mouse.value.set(
      pointer.x < -1 || pointer.x > 1 ? 0 : (pointer.x * 0.5 + 0.5) * w,
      pointer.y < -1 || pointer.y > 1 ? 0 : (pointer.y * 0.5 + 0.5) * h,
    );
    simMaterial.uniforms.textureA.value = pair.a.texture;
    gl.setRenderTarget(pair.b);
    gl.render(simScene, simCamera);
    renderMaterial.uniforms.textureA.value = pair.b.texture;
    renderMaterial.uniforms.textureB.value = background.tex;
    gl.setRenderTarget(null);
    gl.autoClear = true;
    gl.clear();
    gl.render(bgScene, simCamera);
    gl.autoClear = false;
    gl.render(scene, camera);
    gl.autoClear = true;
    const temp = pair.a; pair.a = pair.b; pair.b = temp;
  }, 1);
  return null;
}

function Bottle() {
  const g = useRef<THREE.Group>(null!), mesh = useRef<THREE.Mesh>(null!), mouth = useRef<THREE.Object3D>(null!);
  const { gl: renderer, scene } = useThree();
  const flavorMotion = useRef({ last: -1, mode: "idle" as "idle" | "out" | "in", pending: 0, outDir: 1, inDir: 1, omega: 0, rotY: 0, rotTarget: 0 });
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    return () => { scene.environment = null; environment.dispose(); pmrem.dispose(); };
  }, [renderer, scene]);
  const bottleGltf: any = useGLTF("/models/bottle.glb");
  const geo = useMemo(() => { let m: any; bottleGltf.scene.traverse((o: any) => { if (o.isMesh && !m) m = o; }); return m.geometry as THREE.BufferGeometry; }, []);
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
      const progress = Math.min(0.9999, Math.max(0, S.p));
      const flavor = Math.min(3, Math.floor(progress * 4));
      // Scroll advances the flavour; the bottle stays upright and keeps turning.
      tz = 0; setFlavor(flavor, false);
      tgt = { x: mob ? 0 : Math.min(1.75, halfW * 0.4), y: mob ? 0.15 : -0.12, s: 1.0, show: S.show };
    } else if (route === "/flavours") { tz = 0; tgt = { x: mob ? 0 : Math.min(2.2, halfW * 0.5), y: mob ? 0.45 : 0.1, s: 1.18, show: 1 }; }
    else tgt.show = 0;
    const G = g.current;
    G.rotation.z = damp(G.rotation.z, tz, ease);
    // A little more axial turn reveals the bottle's 3D shape; keep the idle bob restrained.
    const targetYaw = route === "/flavours" ? t * 0.34 + S.drag : t * 0.52;
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
    G.rotation.x = damp(G.rotation.x, 0, ease);
    G.rotation.z = damp(G.rotation.z, tz, ease);
    G.position.x = damp(G.position.x, targetX, 1 - Math.exp(-dt * (motion.mode === "out" ? 6.5 : motion.mode === "in" ? 5.5 : 7.5)));
    G.position.y = damp(G.position.y, tgt.y, ease);
    const small = fi === 3 ? 0.9 : 1;
    const visibilityEase = tgt.show === 0 ? hideEase : ease;
    const sc = damp(G.scale.x, tgt.s * (mob ? 2.72 : 3.18) * tgt.show * small, visibilityEase);
    G.scale.setScalar(Math.max(0.0001, sc));
    // Visibility is route-gated as well as scale-gated: the persistent WebGL
    // stage must never leak the bottle into the homepage hero before ScrollTrigger reveals it.
    G.visible = route === "/" ? (S.show > 0.5 && S.p > 0.015 && sc > 0.02) : route === "/flavours" && sc > 0.02;
    S.bottlePos.copy(G.position); S.glow = damp(S.glow, tgt.show, visibilityEase);
    // The cap, liquid and label are updated together at the off-screen handoff.
    mouth.current.getWorldPosition(S.mouth); S.dir.set(0, 1, 0).applyQuaternion(G.quaternion);
    const on = false;
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
    for (let i = 0; i < N; i++) {
      const b = data[i]; b.y += b.v; if (b.y > 6.2) { b.y = -6.2; b.x = (Math.random() - 0.5) * 16; b.vx = b.vy = 0; }
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
    <Canvas flat dpr={[1, 1.5]} camera={{ fov: 40, position: [0, 0, 8] }} gl={{ alpha: true, antialias: true }}
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} eventSource={typeof document !== "undefined" ? document.body : undefined}>
      <Atmosphere /><Lights /><Glow /><Bokeh /><Bubbles /><Bottle /><Splash />
    </Canvas>
  );
}
