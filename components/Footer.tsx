import { HANDLE, LINKS } from "@/lib/social";
import { RLink } from "./Shell";

export default function Footer() {
  return (
    <footer id="ft">
      <div className="ft-top">
        <div>
          <div className="ft-logo">Razzl</div>
          <p className="ft-say">Your World.</p>
          <p className="ft-copy">Razzl is an exciting and youthful soft drink that exudes freshness and vibrancy. Taste the flavours: Cola, Orange, Lemon and Pamplemousse, made by Ultimum Limited.</p>
        </div>
        <div className="ft-cols">
          <div><b>Explore</b><RLink href="/about">About Razzl</RLink><RLink href="/company">The Company</RLink><RLink href="/flavours">Flavours</RLink><RLink href="/partners">Strategic Partners</RLink><RLink href="/careers">Careers</RLink><RLink href="/culture">Culture</RLink><RLink href="/contact">Contact Us</RLink></div>
          <div><b>Follow @{HANDLE}</b>
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><a href={LINKS.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href={LINKS.x} target="_blank" rel="noopener noreferrer">X</a><a href={LINKS.facebook} target="_blank" rel="noopener noreferrer">Facebook</a><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></div>
        </div>
      </div>
      <p className="ft-small">Concept makeover by Cipher PR. A showcase, not an official Drink Razzl site. Brand text and social posts belong to Drink Razzl and are shown for concept purposes.</p>
    </footer>
  );
}
