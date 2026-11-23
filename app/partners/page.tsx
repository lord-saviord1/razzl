"use client";
import { RLink } from "@/components/Shell";
export default function Partners() {
  return (
    <main className="page">
      <span className="eyebrow">Strategic Partners</span>
      <h1 className="display o-l">Partners</h1>
      <p className="lead serif o-l">Football, culture and community.</p>
      <div className="grid">
        <div className="glass card"><b>AFCON</b><p>Razzl was the exclusive official soft drink of the 2023 Africa Cup of Nations and was named official soft drink again for the 2024 edition.</p></div>
        <div className="glass card"><b>Culture</b><p>Razzl City Tour and RazzlxBole Fest put the brand in markets, campuses and communities.</p></div>
        <div className="glass card"><b>Trade</b><p>Retail outlets and distributors keep Razzl cold and close. Want to stock or partner with Razzl?</p></div>
      </div>
      <div className="links"><RLink href="/contact">Become a partner</RLink><a href="https://www.drinkrazzl.com/strategic-partners/" target="_blank" rel="noopener noreferrer">Partners on drinkrazzl.com</a></div>
    </main>
  );
}
