"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { shop } from "@/lib/shop";
import { cn } from "@/lib/utils";

/**
 * The booking call to action, pinned to the bottom once the hero has
 * scrolled away and until the booking form itself is on screen. On a phone
 * this is the primary way in; on a desktop it is a quiet reminder.
 */
export function StickyBar({ t }: { t: Dictionary }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const booking = document.getElementById("booking");
    if (!hero || !booking) return;

    let heroVisible = true;
    let bookingVisible = false;
    const update = () => setShow(!heroVisible && !bookingVisible);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === booking) bookingVisible = entry.isIntersecting;
        }
        update();
      },
      { threshold: 0.15 },
    );
    observer.observe(hero);
    observer.observe(booking);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md transition-[transform,opacity] duration-300",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <p className="hidden font-serif text-lg text-cream italic sm:block">
          {shop.name} {shop.suffix} — {t.contact.tagline}
        </p>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button asChild size="lg" className="flex-1 sm:flex-none">
            <a href="#booking" tabIndex={show ? 0 : -1}>
              {t.bar.book}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${shop.phone}`} tabIndex={show ? 0 : -1}>
              <Phone className="size-4" aria-hidden />
              {t.bar.call}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
