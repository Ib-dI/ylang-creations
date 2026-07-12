import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  productionBrowserSourceMaps: false, // Suppress source map warnings
  // A stray package-lock.json in the user's home directory (C:\Users\hp)
  // makes Next.js misdetect the workspace root — pin it explicitly.
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
    ],
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 450, 500, 550, 600],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tpqgdmgdgqigsmvatsag.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
