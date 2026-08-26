import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cinzel, Cormorant_Garamond, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getLocale } from "@/lib/i18n/server";
import { shop } from "@/lib/shop";
import { cn } from "@/lib/utils";
import "./globals.css";

/**
 * The engraved caps on the shopfront and the gold wall sign.
 *
 * Cinzel publishes `latin` and `latin-ext` only — there is no Vietnamese
 * subset, so anything set in it loses every diacritic to a fallback face
 * mid-word. It is therefore reserved for the brand lockup ("The Corner",
 * "Barbershop", "Est. 2026"), which is Latin. Interface copy uses `.label`,
 * set in the body face.
 */
const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/** Headings. Carries full Vietnamese diacritics. */
const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/** Body copy — drawn for Vietnamese, so the tone marks sit correctly. */
const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // No domain yet — this keeps Open Graph image URLs absolute in every
  // environment. TODO(content): set NEXT_PUBLIC_SITE_URL once a domain exists.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${shop.name} ${shop.suffix} — ${shop.address.street}`,
    template: `%s · ${shop.name} ${shop.suffix}`,
  },
  description:
    "Tiệm cắt tóc cổ điển tại TP. Hồ Chí Minh — ghế da, gương gỗ, đèn đồng. Đặt lịch cắt tóc, cạo mặt, gội thư giãn.",
  openGraph: {
    title: `${shop.name} ${shop.suffix}`,
    description: "Tiệm cắt tóc cổ điển tại TP. Hồ Chí Minh.",
    images: ["/photos/hero-room.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D100A",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={cn(
        "h-full scroll-smooth",
        display.variable,
        heading.variable,
        body.variable,
        mono.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
