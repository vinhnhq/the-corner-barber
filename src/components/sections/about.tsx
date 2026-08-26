import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { photos } from "@/lib/photos";
import { services, shop } from "@/lib/shop";

/** Counted from the station photos — six mirrors along the wall. */
const CHAIRS = 6;

export function About({ t }: { t: Dictionary }) {
  const sign = photos["detail-est-sign"];
  const carving = photos["detail-carving"];

  const stats = [
    { label: t.about.stats.established, value: String(shop.established) },
    { label: t.about.stats.chairs, value: String(CHAIRS) },
    { label: t.about.stats.services, value: String(services.length) },
  ];

  return (
    <section
      id="about"
      className="scroll-mt-20 border-y border-border/60 bg-card/25 py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 grid gap-4 lg:order-1">
          <Reveal>
            <div className="panel grain relative aspect-[3/2] overflow-hidden">
              <Image
                src={sign.src}
                alt={sign.alt}
                fill
                placeholder="blur"
                blurDataURL={sign.blur}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="panel grain relative aspect-[5/2] overflow-hidden">
              <Image
                src={carving.src}
                alt={carving.alt}
                fill
                placeholder="blur"
                blurDataURL={carving.blur}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} align="start" />

          <div className="mt-6 flex flex-col gap-4">
            {t.about.body.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 24)} delay={i + 1}>
                <p className="text-sm leading-relaxed text-muted-foreground">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={2}>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border/70 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="label text-[0.6rem] text-muted-foreground">{stat.label}</dt>
                  <dd className="font-heading text-3xl text-brass">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
