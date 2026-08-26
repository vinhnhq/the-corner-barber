"use client";

import { useEffect, useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const LABEL: Record<Locale, string> = { vi: "VI", en: "EN" };
const FULL: Record<Locale, string> = { vi: "Tiếng Việt", en: "English" };

/**
 * Two-state language toggle. The choice is stored in a cookie by a Server
 * Action and the page re-renders in the new language — no client dictionary
 * ships, and the markup search engines see matches what the visitor sees.
 *
 * Because the swap is a server round-trip, every string on the page changes at
 * once in a single commit, which reads as a hard flicker. The pending state is
 * mirrored onto the document so CSS can dip the page while the new language is
 * on its way and bring it back when it lands — see `[data-locale-switching]`
 * in `globals.css`. Marking the document rather than a wrapper is deliberate:
 * the header, main and footer all have to fade together, and they are siblings.
 * The whole page fades, this control included — `opacity` applies to the entire
 * subtree, so there is no way to hold one child out of it.
 */
export function LocaleSwitcher({ current, className }: { current: Locale; className?: string }) {
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const root = document.documentElement;
    if (!pending) return;

    root.dataset.localeSwitching = "";
    return () => {
      delete root.dataset.localeSwitching;
    };
  }, [pending]);

  return (
    <nav className={cn("flex items-center gap-px text-[0.7rem]", className)} aria-label="Language">
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={active ? "true" : undefined}
            aria-label={FULL[locale]}
            disabled={pending || active}
            onClick={() => startTransition(() => setLocale(locale))}
            className={cn(
              // A comfortable target on a phone, back to compact from sm upwards so the
              // desktop header keeps its height.
              "label min-h-11 min-w-11 cursor-pointer px-2 text-center transition-colors",
              "sm:min-h-0 sm:min-w-9 sm:py-1",
              active ? "text-brass" : "text-muted-foreground hover:text-cream",
              "disabled:cursor-default",
            )}
          >
            {LABEL[locale]}
          </button>
        );
      })}
    </nav>
  );
}
