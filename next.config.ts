import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false, // Suppress source map warnings
  images: {
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
