import Image from "next/image";
import { MapPin, Navigation, Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { photos } from "@/lib/photos";
import { mapsUrl, shop } from "@/lib/shop";
import { cn } from "@/lib/utils";

/** Sunday-first, matching the `day` numbers in `shop.hours`. */
const WEEK = [1, 2, 3, 4, 5, 6, 0] as const;

export function Visit({ t }: { t: Dictionary }) {
  const front = photos["exterior-front"];
  const board = photos["exterior-signboard"];

  return (
    <section id="visit" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.visit.eyebrow} title={t.visit.title} />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="grid gap-4 sm:grid-cols-2">
            <div className="panel grain relative aspect-[3/4] overflow-hidden">
              <Image
                src={front.src}
                alt={front.alt}
                fill
                placeholder="blur"
                blurDataURL={front.blur}
                sizes="(min-width: 1024px) 28vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="panel grain relative aspect-[3/4] overflow-hidden">
              <Image
                src={board.src}
                alt={board.alt}
                fill
                placeholder="blur"
                blurDataURL={board.blur}
                sizes="(min-width: 1024px) 28vw, 46vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={1} className="panel flex flex-col gap-8 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <h3 className="label flex items-center gap-2 text-[0.66rem] text-brass">
                <MapPin className="size-3.5" aria-hidden />
                {t.visit.address}
              </h3>
              <address className="text-sm leading-relaxed text-cream not-italic">
                {shop.address.street}
                <br />
                {shop.address.ward}, {shop.address.city}
              </address>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="label flex items-center gap-2 text-[0.66rem] text-brass">
                <Phone className="size-3.5" aria-hidden />
                {t.visit.phone}
              </h3>
              <a
                href={`tel:${shop.phone}`}
                className="-my-2 inline-flex min-h-11 items-center font-mono text-lg text-cream transition-colors hover:text-brass"
              >
                {shop.phoneDisplay}
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="label text-[0.66rem] text-brass">{t.visit.hours}</h3>
              <dl className="flex flex-col text-sm">
                {WEEK.map((day) => {
                  const entry = shop.hours.find((h) => h.day === day);
                  if (!entry) return null;
                  const weekend = day === 0 || day === 6;
                  return (
                    <div
                      key={day}
                      className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-0"
                    >
                      <dt className={cn("text-muted-foreground", weekend && "text-cream")}>
                        {t.visit.days[day]}
                      </dt>
                      <dd className="font-mono text-xs text-cream">
                        {entry.open} – {entry.close}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div className="mt-auto flex flex-wrap gap-3">
              <Button asChild>
                <a href={mapsUrl()} target="_blank" rel="noreferrer noopener">
                  <Navigation className="size-4" aria-hidden />
                  {t.visit.directions}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${shop.phone}`}>
                  <Phone className="size-4" aria-hidden />
                  {t.visit.call}
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
