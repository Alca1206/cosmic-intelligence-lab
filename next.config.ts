import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: "export",
  basePath: "/cosmic-intelligence-lab",
  assetPrefix: "/cosmic-intelligence-lab/",
  images: {
    unoptimized: true,
  }
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
