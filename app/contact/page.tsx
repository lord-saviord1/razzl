"use client";
import { useState } from "react";
export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <main className="page">
      <span className="eyebrow">Contact Us</span>
      <h1 className="display o-l">Say hello</h1>
      <p className="lead serif o-l">Distributors, sponsorships, merch drops.</p>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <input placeholder="Name" required aria-label="Name" />
        <input type="email" placeholder="Email" required aria-label="Email" />
        <select aria-label="Reason" defaultValue="Distribution" style={{ background: "rgba(255,255,255,.78)", color: "#3B1950" }}><option>Distribution</option><option>Event sponsorship</option><option>Merch drop</option><option>Something else</option></select>
        <textarea rows={5} placeholder="Message" aria-label="Message" />
        <button className="btn mag" style={{ justifySelf: "start" }}>{sent ? "Received (demo)" : "Send it"}</button>
        {sent && <small>This concept form is not connected to a mailbox yet.</small>}
      </form>
    </main>
  );
}
