import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { fill, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";
import { CARD_SIZES, type Media } from "@/lib/media";
import { formatPrice, formatVnd, type Service } from "@/lib/shop";
import { cn } from "@/lib/utils";

type ServicesProps = {
  t: Dictionary;
  locale: Locale;
  services: Service[];
  /** One picture per package card, from the `package-n` slots; a card without one is all type. */
  pictures: (Media | undefined)[];
};

function name(service: Service, locale: Locale) {
  return locale === "vi" ? service.nameVi : service.nameEn;
}

function includes(service: Service, locale: Locale) {
  return locale === "vi" ? service.includesVi : service.includesEn;
}

function tagline(service: Service, locale: Locale) {
  return locale === "vi" ? service.taglineVi : service.taglineEn;
}

function PackageCard({
  service,
  locale,
  t,
  photo,
  number,
  featured,
}: {
  service: Service;
  locale: Locale;
  t: Dictionary;
  photo: Media | undefined;
  /** 1-based position in the menu — "Gói 1", "Gói 2"… */
  number: number;
  featured: boolean;
}) {
  const line = tagline(service, locale);

  return (
    <article
      className={cn(
        // `w-full` matters: the card sits inside a flex wrapper, and without it
        // the article is sized by its content instead of the grid cell.
        "surface group flex h-full w-full flex-col overflow-hidden",
        // The package the shop leads with sits one step lighter, not outlined.
        featured && "bg-muted",
      )}
    >
      <div className={cn("relative overflow-hidden", photo ? "aspect-[4/3]" : "h-14")}>
        {photo && (
          <>
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              placeholder="blur"
              blurDataURL={photo.blur}
              sizes={CARD_SIZES}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t to-transparent",
                featured ? "from-muted via-muted/25" : "from-card via-card/25",
              )}
            />
          </>
        )}
        <span className="tag absolute top-3 left-3 rounded-full bg-background/80 px-3 py-1.5 text-brass">
          {fill(t.services.package, { n: number })}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="text-2xl text-cream">{name(service, locale)}</h3>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            ≈ {service.minutes} {t.services.minutes}
          </p>
        </div>

        <p className="flex items-baseline gap-3">
          <span className="text-3xl text-brass tabular-nums">{formatPrice(service)}</span>
          {service.wasPrice !== null && (
            <span className="text-sm text-muted-foreground tabular-nums line-through">
              {formatVnd(service.wasPrice)}
            </span>
          )}
        </p>

        <ul className="flex flex-col gap-2 text-base text-muted-foreground">
          {includes(service, locale).map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-1 size-4 shrink-0 text-brass" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {line && <p className="mt-auto pt-2 text-base leading-relaxed text-cream/80">{line}</p>}

        <Button
          asChild
          variant={featured ? "default" : "secondary"}
          className={cn("h-11 w-full sm:h-9", !line && "mt-auto")}
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
    <div className="surface p-6 sm:p-8">
      <h3 className="tag text-brass">{title}</h3>
      {/* Rows separated by space, prices tabular so the column reads. */}
      <ul className="mt-5 flex flex-col gap-1">
        {services.map((service) => (
          <li key={service.slug} className="flex items-baseline justify-between gap-6 py-2.5">
            <span className="text-base text-cream">{name(service, locale)}</span>
            <span className="text-base whitespace-nowrap text-brass tabular-nums">
              {formatPrice(service)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Services({ t, locale, services, pictures }: ServicesProps) {
  const packages = services.filter((s) => s.group === "package");
  const signature = (["relax", "colour", "perm"] as const)
    .map((group) => ({ group, items: services.filter((s) => s.group === group) }))
    .filter(({ items }) => items.length > 0);

  return (
    <section id="services" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {packages.map((service, i) => (
            <Reveal key={service.slug} delay={i} as="div" className="flex">
              <PackageCard
                service={service}
                locale={locale}
                t={t}
                photo={pictures[i]}
                number={i + 1}
                // The middle package is the one the shop leads with.
                featured={i === 1}
              />
            </Reveal>
          ))}
        </div>

        <SectionHeading
          eyebrow={t.services.signatureEyebrow}
          title={t.services.signatureTitle}
          className="mt-24"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {signature.map(({ group, items }, i) => (
            <Reveal key={group} delay={i}>
              <PriceList title={t.services.groups[group]} services={items} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
