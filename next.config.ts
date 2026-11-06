
import type { NextConfig } from "next";

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  "/cosmic-intelligence-lab";

const nextConfig: NextConfig = {
  output: "export",

  basePath,

  assetPrefix: basePath ? `${basePath}/` : "",

  images: {
    unoptimized: true,
  },

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
