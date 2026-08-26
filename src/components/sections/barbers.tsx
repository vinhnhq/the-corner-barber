import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { photos, type PhotoId } from "@/lib/photos";
import { barbers } from "@/lib/shop";

/**
 * The team. Names are still placeholders (`TODO(content)` in `src/lib/shop.ts`)
 * so only the barbers with a portrait are shown — "any barber" is a booking
 * option, not a person.
 */
export function Barbers({ t, locale }: { t: Dictionary; locale: Locale }) {
  const team = barbers.filter((b) => b.photoId !== null);

  return (
    <section id="barbers" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.barbers.eyebrow} title={t.barbers.title} lede={t.barbers.lede} />

        <ul className="mt-16 grid gap-6 sm:grid-cols-3">
          {team.map((barber, i) => {
            const photo = photos[barber.photoId as PhotoId];
            return (
              <Reveal key={barber.slug} as="li" delay={i}>
                <figure className="panel group overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      placeholder="blur"
                      blurDataURL={photo.blur}
                      sizes="(min-width: 640px) 31vw, 92vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                  <figcaption className="p-5 text-center">
                    <p className="font-heading text-xl text-cream">
                      {locale === "vi" ? barber.nameVi : barber.nameEn}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
