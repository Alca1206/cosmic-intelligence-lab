import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static, so it is exported as plain files (the "out" folder) that
  // GitHub Pages, or any file host, can serve. No server is needed.
  output: "export",
  trailingSlash: true, // /about/ -> about/index.html, which static hosts understand
  images: { unoptimized: true }, // image optimisation needs a server
  // Empty when the site lives at the root (username.github.io). Set to "/repo-name" when
  // it lives in a sub-folder (username.github.io/repo-name). The deploy workflow does this.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
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
