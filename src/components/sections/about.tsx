import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Media } from "@/lib/media";

type AboutProps = { t: Dictionary; pictures: [Media | undefined, Media | undefined] };

export function About({ t, pictures: [sign, carving] }: AboutProps) {
  return (
    <section id="about" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 grid gap-4 lg:order-1">
          {sign && (
            <Reveal>
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                <Image
                  src={sign.url}
                  alt={sign.alt}
                  fill
                  placeholder="blur"
                  blurDataURL={sign.blur}
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
          {carving && (
            <Reveal delay={1}>
              <div className="relative aspect-[5/2] overflow-hidden rounded-2xl">
                <Image
                  src={carving.url}
                  alt={carving.alt}
                  fill
                  placeholder="blur"
                  blurDataURL={carving.blur}
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} align="start" />
          <Reveal delay={2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.about.body}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
