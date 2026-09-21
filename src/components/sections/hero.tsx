import Image from "next/image";
import { ChevronDown, Phone } from "lucide-react";
import { Accent } from "@/components/accent";
import { HeroVideo } from "@/components/hero-video";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Media } from "@/lib/media";
import { shop } from "@/lib/shop";

/**
 * Type on the left, picture weighted to the right: the scrim darkens from the
 * left edge so the headline sits on near-black and the photograph is left
 * alone where it matters. The backdrop is whatever fills the `hero` slot —
 * a looping clip, a still, or nothing.
 */
export function Hero({ t, backdrop }: { t: Dictionary; backdrop: Media | undefined }) {
  return (
    <section id="top" className="relative isolate min-h-[94svh] overflow-hidden">
      <div className="absolute inset-0 -z-20">
        {backdrop?.kind === "video" && (
          <HeroVideo poster={backdrop.posterUrl ?? undefined} src={backdrop.url} />
        )}
        {backdrop?.kind === "image" && (
          <Image
            src={backdrop.url}
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL={backdrop.blur}
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
      </div>
      <div className="scrim absolute inset-0 -z-10" />

      <div className="relative mx-auto flex min-h-[94svh] max-w-7xl flex-col justify-end px-5 pt-32 pb-16 sm:px-8 sm:pb-20 lg:justify-center lg:pb-24">
        <div className="max-w-2xl">
          <Reveal delay={0}>
            <p className="tag text-brass">{t.hero.eyebrow}</p>
          </Reveal>

          <Reveal delay={1} className="mt-6">
            <h1 className="text-5xl leading-[1.02] text-cream sm:text-6xl lg:text-[5rem]">
              <Accent text={t.hero.headline} />
            </h1>
          </Reveal>

          <Reveal delay={2} className="mt-6 max-w-xl">
            <p className="font-serif text-xl leading-relaxed text-gold/90 italic sm:text-2xl">
              {t.hero.lede}
            </p>
          </Reveal>

          <Reveal delay={3} className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="min-w-40">
              <a href="#booking">{t.hero.book}</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${shop.phone}`}>
                <Phone className="size-4" aria-hidden />
                {t.hero.call}
              </a>
            </Button>
          </Reveal>

          <Reveal delay={4} className="mt-5">
            <p className="tag hidden text-dim sm:block">{t.hero.note}</p>
          </Reveal>

          <Reveal delay={5} className="mt-10">
            <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border/80 pt-6">
              {t.hero.stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <dd className="order-1 font-serif text-3xl leading-none text-cream">
                    {stat.value}
                  </dd>
                  <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <a
        href="#about"
        className="absolute right-5 bottom-6 hidden flex-col items-center gap-2 text-dim transition-colors hover:text-cream sm:right-8 lg:flex"
      >
        <span className="tag">{t.hero.scroll}</span>
        <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
