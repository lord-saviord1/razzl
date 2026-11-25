"use client";
import { RLink } from "@/components/Shell";
export default function Careers() {
  return (
    <main className="page">
      <span className="eyebrow">Careers</span>
      <h1 className="display o-l">Join the Razzl world</h1>
      <p className="lead serif o-l">Bring your energy. Help shape what comes next.</p>
      <p>Razzl is made by Ultimum Limited, a fast-growing food and beverage company. Current openings are listed on the official careers page.</p>
      <p className="section-intro">Whether your strengths are in creativity, operations, sales or building relationships, explore the opportunities shared by the company and find the role that fits your next step.</p>
      <div className="links"><a href="https://www.drinkrazzl.com/careers/" target="_blank" rel="noopener noreferrer">See open roles</a><RLink href="/contact">Introduce yourself</RLink></div>
    </main>
  );
}
