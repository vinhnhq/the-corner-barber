import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getLocale } from "@/lib/i18n/server";
import { shop } from "@/lib/shop";
import { cn } from "@/lib/utils";
import "./globals.css";

/**
 * Three faces with strict roles — the contrast between them is the look:
 * Cormorant for display (with one italic phrase in gold per heading), IBM
 * Plex Mono in tracked caps for every label, price and piece of meta, and
 * Inter for reading. All three carry the Vietnamese range, so tone marks sit
 * correctly at every size.
 */
const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  // No domain yet — this keeps Open Graph image URLs absolute in every
  // environment. TODO(content): set NEXT_PUBLIC_SITE_URL once a domain exists.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${shop.name} ${shop.suffix} — ${shop.address.street}`,
    template: `%s — ${shop.name} ${shop.suffix}`,
  },
  description:
    "Không ồn ào. Không vội vã. Một không gian nơi người đàn ông tìm lại sự chỉn chu của mình — đặt lịch cắt tóc tại TP. Hồ Chí Minh.",
  openGraph: {
    title: `${shop.name} ${shop.suffix}`,
    description: "Không ồn ào. Không vội vã.",
    // The Open Graph card. Media lives in Blob; this is the room shot by id.
    images: ["https://ym60qszluhzb8wqs.public.blob.vercel-storage.com/media/hero-room.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={cn("h-full scroll-smooth", serif.variable, mono.variable, sans.variable)}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
