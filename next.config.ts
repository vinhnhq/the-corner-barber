import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // All imagery is local and pre-encoded by scripts/process-photos.ts, so the
    // optimizer only ever needs to pick a width from an existing AVIF/WebP.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
  reactCompiler: true,
};

export default nextConfig;
