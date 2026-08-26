import type { MetadataRoute } from "next";
import { shop } from "@/lib/shop";

/**
 * Served at /manifest.webmanifest, with the link tag added automatically.
 *
 * This replaces the `site.webmanifest` that came out of the icon generator,
 * which shipped an empty `name` and a white `theme_color` — on a near-black
 * site that produced a white status bar and an unnamed home-screen icon.
 *
 * Two icon entries per size: `any` for the launcher, and a `maskable` copy with
 * the mark held inside the centre safe zone, because Android crops maskable
 * icons to whatever shape the launcher uses.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${shop.name} ${shop.suffix}`,
    short_name: shop.name,
    description: "Tiệm cắt tóc cổ điển tại TP. Hồ Chí Minh.",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    background_color: "#0D100A",
    theme_color: "#0D100A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
