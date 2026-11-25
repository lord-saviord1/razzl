"use client";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Intro from "./Intro";
import { S } from "@/lib/store";
import { FL } from "@/lib/store";

const Stage = dynamic(() => import("./Stage"), { ssr: false });
export const norm = (p: string) => (p.replace(/\/$/, "") || "/");

export function useFlavor() {
  const [, set] = useState(0);
  useEffect(() => { const f = () => set((n) => n + 1); S.listeners.add(f); return () => { S.listeners.delete(f); }; }, []);
  return { i: S.flavor, f: FL[S.flavor], spill: S.spillOn };
}

export function RLink({ href, children, className, onClick, ...rest }: any) {
  return (<a href={href} className={className} {...rest} onClick={(e) => { e.preventDefault(); onClick && onClick(); S.go && S.go(href); }}>{children}</a>);
}

const MENU: [string, string][] = [["Home", "/"], ["About Razzl", "/about"], ["The Company", "/company"], ["Flavours", "/flavours"], ["Strategic Partners", "/partners"], ["Careers", "/careers"], ["Culture", "/culture"], ["Contact Us", "/contact"]];

function Menu({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) {
  return (
    <div id="menu" className={open ? "open" : ""} aria-hidden={!open}>
      <nav>{MENU.map(([n, h], k) => (<RLink key={h} href={h} className="ml" onClick={() => setOpen(false)} style={{ transitionDelay: open ? k * 45 + "ms" : "0ms" }} tabIndex={open ? 0 : -1}><i>{String(k + 1).padStart(2, "0")}</i>{n}</RLink>))}</nav>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = norm(usePathname() || "/"), router = useRouter(), veil = useRef<HTMLDivElement>(null), [open, setOpen] = useState(false);
  useEffect(() => {
    S.go = (href: string) => {
      const el = veil.current!; el.classList.add("on");
      setTimeout(() => { router.push(href); if (S.lenis) S.lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0); setTimeout(() => el.classList.remove("on"), 200); }, 420);
    };
  }, [router]);
  useEffect(() => {
    S.route = path;
    document.body.dataset.route = path;

    // Clear home-page scroll and spill state before the persistent WebGL stage
    // starts animating the newly selected route.
    S.p = 0;
    S.spillOn = false;
    S.pop = 0;
    S.burst = 0;
    // The homepage reveals its bottle only when the pinned flavour section enters.
    // The dedicated flavours route keeps the bottle visible immediately.
    S.show = path === "/flavours" ? 1 : 0;

    // A drag offset belongs to the flavour inspection page, not the next route.
    if (path !== "/flavours") S.drag = 0;
  }, [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; if (S.lenis) { open ? S.lenis.stop() : S.lenis.start(); } }, [open]);
  useEffect(() => { // smooth scroll (Lenis) wired to GSAP ScrollTrigger
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1 }); S.lenis = lenis; lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); S.lenis = null; };
  }, []);
  useEffect(() => { // magnetic buttons
    const els = Array.from(document.querySelectorAll<HTMLElement>(".mag"));
    const q = els.map((el) => ({ el, x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }) }));
    const mv = (e: MouseEvent) => q.forEach(({ el, x, y }) => {
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) / 2 + 60; x(near ? dx * 0.3 : 0); y(near ? dy * 0.3 : 0);
    });
    addEventListener("mousemove", mv); return () => removeEventListener("mousemove", mv);
  }, [path]);
  return (
    <>
      <div id="amb" aria-hidden="true" /><div id="vig" aria-hidden="true" /><Stage /><div id="grain" aria-hidden="true" />
      <header id="hd">
        <RLink href="/" className="logo" onClick={() => setOpen(false)}>Razzl</RLink>
        <button id="burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}><span />{open ? "Close" : "Menu"}</button>
      </header>
      <Menu open={open} setOpen={setOpen} />
      {children}
      <div id="veil" ref={veil} aria-hidden="true" />
      <Intro />
    </>
  );
}
