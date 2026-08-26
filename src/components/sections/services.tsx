import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { photos } from "@/lib/photos";
import { formatVnd, type Service } from "@/lib/shop";
import { cn } from "@/lib/utils";

type ServicesProps = { t: Dictionary; locale: Locale; services: Service[] };

/**
 * One photo per package, in menu order, so the cards are not all type. All
 * three are shot in the olive room rather than the white treatment room at the
 * back — the wash and facial pictures are honest but read as a different
 * business next to the rest of the page. They still appear in the gallery.
 */
const PACKAGE_PHOTO = ["craft-cut-window", "craft-style", "craft-nails"] as const;

function name(service: Service, locale: Locale) {
  return locale === "vi" ? service.nameVi : service.nameEn;
}

function includes(service: Service, locale: Locale) {
  return locale === "vi" ? service.includesVi : service.includesEn;
}

function PackageCard({
  service,
  locale,
  t,
  photoId,
  featured,
}: {
  service: Service;
  locale: Locale;
  t: Dictionary;
  photoId: (typeof PACKAGE_PHOTO)[number];
  featured: boolean;
}) {
  const photo = photos[photoId];

  return (
    <article
      className={cn(
        // `w-full` matters: the card sits inside a flex wrapper, and without it
        // the article is sized by its content instead of the grid cell.
        "panel group flex h-full w-full flex-col overflow-hidden",
        featured && "ring-1 ring-brass/40",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          placeholder="blur"
          blurDataURL={photo.blur}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent" />
        {service.wasPrice !== null && (
          <span className="label absolute top-3 right-3 bg-brass px-2 py-1 text-[0.6rem] text-primary-foreground">
            {t.services.save}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="font-heading text-2xl text-cream">{name(service, locale)}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            ≈ {service.minutes} {t.services.minutes}
          </p>
        </div>

        <p className="flex items-baseline gap-3">
          <span className="font-heading text-3xl text-brass">{formatVnd(service.price)}</span>
          {service.wasPrice !== null && (
            <span className="text-sm text-muted-foreground line-through">
              {formatVnd(service.wasPrice)}
            </span>
          )}
        </p>

        <ul className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
          {includes(service, locale).map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-3.5 shrink-0 text-brass-dim" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <Button
          asChild
          variant={featured ? "default" : "outline"}
          className="mt-2 h-11 w-full sm:h-9"
        >
          <a href={`#booking?service=${service.slug}`}>{t.services.book}</a>
        </Button>
      </div>
    </article>
  );
}

function PriceList({
  title,
  services,
  locale,
}: {
  title: string;
  services: Service[];
  locale: Locale;
}) {
  return (
    <div className="panel p-6 sm:p-8">
      <h3 className="label text-[0.68rem] text-brass">{title}</h3>
      <ul className="mt-5 flex flex-col">
        {services.map((service) => (
          <li
            key={service.slug}
            className="flex items-baseline justify-between gap-6 border-b border-border/60 py-3 last:border-0"
          >
            <span className="text-sm text-cream">{name(service, locale)}</span>
            <span className="font-mono text-sm text-brass">{formatVnd(service.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Services({ t, locale, services }: ServicesProps) {
  const packages = services.filter((s) => s.group === "package");
  const singles = services.filter((s) => s.group === "single");
  const colour = services.filter((s) => s.group === "colour");

  return (
    <section id="services" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          lede={t.services.lede}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {packages.map((service, i) => (
            <Reveal key={service.slug} delay={i} as="div" className="flex">
              <PackageCard
                service={service}
                locale={locale}
                t={t}
                photoId={PACKAGE_PHOTO[i] ?? PACKAGE_PHOTO[0]}
                featured={service.wasPrice !== null}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal delay={1}>
            <PriceList title={t.services.singles} services={singles} locale={locale} />
          </Reveal>
          <Reveal delay={2}>
            <PriceList title={t.services.colour} services={colour} locale={locale} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
