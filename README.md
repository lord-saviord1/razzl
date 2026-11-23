# Razzl Your World (concept)
Next.js 14 (App Router) + React Three Fiber + GSAP, exported as a static site. A persistent WebGL stage lives in `app/layout.tsx` (via `components/Shell.tsx`) so the bottle and bubbles never reload between routes.

Routes: `/` (hero + pinned tilt-and-spill), `/about`, `/company`, `/flavours`, `/partners`, `/careers`, `/culture` (promo, social wall, Instagram embeds), `/contact`. The menu follows the structure of drinkrazzl.com.

The bottle (`public/models/bottle.glb`) is rebuilt from your three scans: the surface is sampled around the bottle, averaged and smoothed so the scan noise is gone but the real 60cl shape stays. Liquid, cap and label are painted in code (`components/Stage.tsx`), with labels from `lib/label.ts`. Pamplemousse (40cl) uses the same bottle at 88%.

Instagram/TikTok embeds: edit `INSTAGRAM_URLS` / `TIKTOK_URLS` in `lib/social.ts`.

## Deploy: GitHub, then Cloudflare (no local server needed)
Cloudflare's current flow for new projects is Workers with static assets ("Workers Builds"), which has a build command and a deploy command. `next.config.mjs` exports the site to `out/` and `wrangler.jsonc` tells Cloudflare to serve that folder.

1. Create a GitHub repo and upload everything in this folder through the GitHub web UI (keep `public/models`, `public/social` and `wrangler.jsonc`).
2. Cloudflare dashboard: Workers & Pages, Create application, Import a repository (Git), pick the repo.
3. Project name: `razzl-your-world` (must match `name` in `wrangler.jsonc`, or change one of them).
4. Build command: `npm run build`
5. Deploy command: `npx wrangler deploy` (the default)
6. Optional build variable: `NODE_VERSION` = `20`.
7. After the first deploy: the Worker's Settings, Domains & Routes, Add, Custom domain, then type your subdomain (the domain is already on Cloudflare so it connects automatically).

Older Cloudflare Pages route (if your dashboard still offers it): preset `Next.js (Static HTML Export)`, build command `npx next build`, output directory `out`.

Do not use the plain "Next.js" server preset or OpenNext: this site is a static export and does not need them.

## Cipher PR touches (pulled from the Jochebed's Touch build)
- ASCII boot intro, once per browsing session, skippable with the button, Enter, Esc or a click; skipped for reduced-motion users (`components/Intro.tsx`).
- Hero word reacts to the cursor, with a "move your cursor across the word" hint (`components/Letters.tsx`).
- Custom WebGL shader atmosphere in the flavour colours; the CSS gradient stays as the no-WebGL fallback (`Atmosphere` in `components/Stage.tsx`).
- Lenis smooth scroll wired to GSAP ScrollTrigger; off for reduced motion.
- SEO pack: Open Graph / Twitter tags, JSON-LD, `robots`, `sitemap`, manifest and favicon. Set `NEXT_PUBLIC_SITE_URL` (or edit `lib/site.ts`) to the real subdomain. A 1200x630 share image (`og-image.jpg`) is still to be added.
