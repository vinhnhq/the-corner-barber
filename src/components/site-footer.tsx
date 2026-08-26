import { LocaleSwitcher } from "@/components/locale-switcher";
import { Wordmark } from "@/components/wordmark";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { mapsUrl, shop } from "@/lib/shop";

export function SiteFooter({ t, locale }: { t: Dictionary; locale: Locale }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 sm:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <Wordmark variant="full" withMark className="text-3xl" />
          <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
        </div>

        <div className="grid gap-8 border-t border-border/60 pt-10 text-center sm:grid-cols-3 sm:text-left">
          <div className="flex flex-col gap-1.5">
            <p className="label text-[0.6rem] text-brass">{t.visit.address}</p>
            <a
              href={mapsUrl()}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-muted-foreground transition-colors hover:text-cream"
            >
              {shop.address.street}
              <br />
              {shop.address.ward}, {shop.address.city}
            </a>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="label text-[0.6rem] text-brass">{t.visit.phone}</p>
            <a
              href={`tel:${shop.phone}`}
              className="-my-2 inline-flex min-h-11 items-center justify-center font-mono text-sm text-muted-foreground transition-colors hover:text-cream sm:justify-start"
            >
              {shop.phoneDisplay}
            </a>
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <p className="label text-[0.6rem] text-brass">{t.footer.language}</p>
            <LocaleSwitcher current={locale} className="-ml-2" />
          </div>
        </div>

        <p className="border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
          © {year} {shop.name} {shop.suffix}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
