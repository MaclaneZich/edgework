import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Edgework is a fully client-side app (all state lives in the browser), so the
  // Cache Components / partial prefetching model adds nothing here and its
  // Activity-based route preservation would keep timers alive across routes.
  cacheComponents: false,
  reactStrictMode: true,
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
