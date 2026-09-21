import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Every picture lives in Vercel Blob, already sized and stripped by the
    // upload flow (or the import script); the optimizer only picks a width
    // and re-encodes to AVIF/WebP.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  reactCompiler: true,
};

export default nextConfig;
