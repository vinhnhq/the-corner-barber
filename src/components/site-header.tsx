"use client";

import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { shop } from "@/lib/shop";
import { cn } from "@/lib/utils";

type SiteHeaderProps = { locale: Locale; t: Dictionary };

const SECTIONS = ["services", "gallery", "barbers", "about", "visit"] as const;

export function SiteHeader({ locale, t }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // The bar is transparent over the hero and gains a background once the page
  // has moved, so the wordmark never sits on a hard edge at rest.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A fixed body under an open drawer stops the page scrolling behind it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" className="shrink-0 text-lg" aria-label={`${shop.name} ${shop.suffix}`}>
          <Wordmark withMark />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Chính">
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="label text-[0.72rem] text-muted-foreground transition-colors hover:text-cream"
            >
              {t.nav[id]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher current={locale} className="hidden sm:flex" />

          {/* Reserve the wider of the two languages. Without this the button
              shrinks from "Đặt lịch" to "Book" on switch, and because it sits
              in the right-aligned group the language control beside it slides
              out from under the cursor that just pressed it. */}
          <Button asChild size="sm" className="hidden min-w-[5.5rem] sm:inline-flex">
            <a href="#booking">{t.nav.book}</a>
          </Button>

          <a
            href={`tel:${shop.phone}`}
            className="p-3 text-brass transition-colors hover:text-cream sm:hidden"
            aria-label={`${t.visit.call} ${shop.phoneDisplay}`}
          >
            <Phone className="size-5" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-3 text-cream lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Đóng menu" : "Mở menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer. Kept in the DOM only while open so its links stay out
          of the tab order the rest of the time. */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-border/70 bg-background/97 backdrop-blur-md lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-4 sm:px-8" aria-label="Chính">
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="label border-b border-border/50 py-4 text-sm text-muted-foreground transition-colors hover:text-cream"
              >
                {t.nav[id]}
              </a>
            ))}
            <div className="flex items-center justify-between pt-5">
              <LocaleSwitcher current={locale} />
              <Button asChild size="sm" className="min-w-[5.5rem]">
                <a href="#booking" onClick={() => setOpen(false)}>
                  {t.nav.book}
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
