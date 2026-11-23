import type { Metadata, Viewport } from "next";
import { Syne, Instrument_Serif, Bricolage_Grotesque, Kaushan_Script } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

const display = Syne({ weight: ["700", "800"], subsets: ["latin"], variable: "--f-display" });
const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--f-serif" });
const body = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-body" });
const script = Kaushan_Script({ weight: "400", subsets: ["latin"], variable: "--f-script" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Razzl Your World – concept site for Drink Razzl",
  description: "A concept makeover of drinkrazzl.com by Cipher PR. A showcase, not an official Drink Razzl site.",
  openGraph: { title: "Razzl Your World – concept makeover", description: "Cola, Orange, Lemon and Pamplemousse in 3D. A concept by Cipher PR.", url: SITE_URL, siteName: "Razzl Your World (concept)", locale: "en_NG", type: "website" },
  twitter: { card: "summary_large_image", title: "Razzl Your World – concept makeover", description: "A concept makeover of drinkrazzl.com by Cipher PR." },
};
export const viewport: Viewport = { themeColor: "#07050d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${serif.variable} ${body.variable} ${script.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('razzl-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches||location.hash==='#links')document.documentElement.classList.add('no-intro')}catch(e){}" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Razzl Your World (concept)", url: SITE_URL, about: { "@type": "Brand", name: "Razzl", sameAs: ["https://www.instagram.com/drinkrazzl_ng", "https://www.tiktok.com/@drinkrazzl_ng", "https://x.com/drinkrazzl_ng", "https://youtube.com/@drinkrazzl_ng"] } }) }} />
      </head>
      <body><Shell>{children}<Footer /></Shell></body>
    </html>
  );
}
