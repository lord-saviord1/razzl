/** @type {import('next').NextConfig} */
// Static export: the whole site runs in the browser, so Cloudflare Pages can host the plain `out/` folder.
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
