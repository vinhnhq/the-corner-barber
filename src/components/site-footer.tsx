import { LocaleSwitcher } from "@/components/locale-switcher";
import { Wordmark } from "@/components/wordmark";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { mapsUrl, shop } from "@/lib/shop";

/** Sunday-first, matching the `day` numbers in `shop.hours`. */
const WEEK = [1, 2, 3, 4, 5, 6, 0] as const;

const NAV = [
  { id: "top", key: "home" },
  { id: "services", key: "services" },
  { id: "space", key: "space" },
  { id: "booking", key: "book" },
  { id: "contact", key: "contact" },
] as const;

/**
 * The footer doubles as the contact section: the lockup and a line, then
 * three mono-headed columns — navigation, contact, hours — over a hairline,
 * and a bottom row of small mono. Social links render only once the shop
 * supplies them (`shop.social`).
 */
export function SiteFooter({ t, locale }: { t: Dictionary; locale: Locale }) {
  const year = new Date().getFullYear();

  const links = [
    { label: "Facebook", href: shop.social.facebook },
    { label: "TikTok", href: shop.social.tiktok },
    { label: t.contact.directions, href: mapsUrl() },
  ].filter((link) => link.href !== "");

  const linkClass =
    "inline-flex min-h-11 items-center text-[0.9375rem] text-muted-foreground transition-colors hover:text-cream sm:min-h-0 sm:py-1";

  return (
    <footer id="contact" className="scroll-mt-20 border-t border-border pt-16 pb-28 sm:pt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-4">
            <Wordmark withMark className="text-xl" />
            <p className="font-serif text-xl text-muted-foreground italic">{t.contact.tagline}</p>
          </div>

          <nav aria-label="Chân trang" className="flex flex-col gap-3">
            <p className="tag text-dim">{t.contact.nav}</p>
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={linkClass}>
                    {t.nav[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <p className="tag text-dim">{t.contact.reach}</p>
            <a
              href={`tel:${shop.phone}`}
              className="inline-flex min-h-11 items-center font-mono text-base text-cream transition-colors hover:text-gold sm:min-h-0 sm:py-1"
            >
              {shop.phoneDisplay}
            </a>
            <a
              href={mapsUrl()}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[0.9375rem] leading-relaxed text-muted-foreground transition-colors hover:text-cream"
            >
              {shop.address.street}
              <br />
              {shop.address.ward}, {shop.address.city}
            </a>
            <ul className="tag flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-cream sm:min-h-0"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="tag text-dim">{t.contact.hours}</p>
            <dl className="flex flex-col gap-1.5 text-[0.9375rem]">
              {WEEK.map((day) => {
                const entry = shop.hours.find((h) => h.day === day);
                if (!entry) return null;
                return (
                  <div key={day} className="flex justify-between gap-6">
                    <dt className="text-muted-foreground">{t.contact.days[day]}</dt>
                    <dd className="font-mono text-sm text-cream tabular-nums">
                      {entry.open} – {entry.close}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        <div className="tag flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-dim sm:flex-row sm:items-center">
          <p>
            © {year} {shop.name} {shop.suffix} — {t.contact.rights}
          </p>
          <div className="flex items-center gap-3">
            <span>{t.contact.language}</span>
            <LocaleSwitcher current={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}
