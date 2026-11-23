import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Razzl Your World (concept)", short_name: "Razzl", start_url: "/", display: "standalone", background_color: "#07050d", theme_color: "#07050d" };
}
