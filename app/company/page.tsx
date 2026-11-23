"use client";
import { RLink } from "@/components/Shell";
export default function Company() {
  return (
    <main className="page">
      <span className="eyebrow">The Company</span>
      <h1 className="display o-l">Ultimum</h1>
      <p className="lead serif o-l">A fast-growing food and beverage manufacturer.</p>
      <p>Ultimum Limited is headquartered in Lagos, with its manufacturing centre in Osisioma, Aba, Abia State, Nigeria. It operates as a member of the Kadji Group of Companies, a diversified and well-established business conglomerate in Africa with over 50 years of heritage.</p>
      <div className="grid">
        <div className="glass card"><b>Lagos</b><p>Headquarters.</p></div>
        <div className="glass card"><b>Aba</b><p>Manufacturing centre in Osisioma, Abia State.</p></div>
        <div className="glass card"><b>Kadji Group</b><p>Over 50 years of heritage across Africa.</p></div>
      </div>
      <div className="links"><RLink href="/partners">Strategic partners</RLink><RLink href="/careers">Careers</RLink><RLink href="/contact">Contact us</RLink><a href="https://www.drinkrazzl.com/ultimum/" target="_blank" rel="noopener noreferrer">Full overview on drinkrazzl.com</a></div>
    </main>
  );
}
