import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: `${SITE_URL}${r === "/" ? "/" : r + "/"}`, lastModified: new Date("2026-11-22") }));
}
