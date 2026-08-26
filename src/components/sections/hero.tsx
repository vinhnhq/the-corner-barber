import { ChevronDown } from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { shop } from "@/lib/shop";

export function Hero({ t }: { t: Dictionary }) {
  return (
    <section id="top" className="relative isolate grain min-h-[92svh] overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <HeroVideo poster="/video/hero-loop-poster.jpg" src="/video/hero-loop.mp4" />
      </div>
      <div className="vignette absolute inset-0 -z-10" />

      <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col items-center justify-center px-5 pt-28 pb-24 text-center sm:px-8">
        <Reveal delay={0}>
          <p className="label text-[0.7rem] text-brass">{t.hero.eyebrow}</p>
        </Reveal>

        <Reveal delay={1} className="mt-8">
          <Wordmark variant="full" className="text-6xl sm:text-7xl lg:text-8xl" />
        </Reveal>

        <Reveal delay={2} className="mt-10 max-w-2xl">
          <h1 className="font-heading text-3xl leading-[1.15] text-cream sm:text-4xl lg:text-5xl">
            {t.hero.headline}
          </h1>
        </Reveal>

        <Reveal delay={3} className="mt-5 max-w-xl">
          <p className="text-sm leading-relaxed text-cream/85 sm:text-base">{t.hero.lede}</p>
        </Reveal>

        <Reveal delay={4} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href="#booking">{t.hero.book}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#services">{t.hero.seeServices}</a>
          </Button>
        </Reveal>

        <Reveal delay={5} className="mt-8">
          <a
            href={`tel:${shop.phone}`}
            className="label inline-flex min-h-11 items-center text-sm text-brass transition-colors hover:text-cream"
          >
            {shop.phoneDisplay}
          </a>
        </Reveal>
      </div>

      <a
        href="#services"
        className="absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-cream"
      >
        <span className="label text-[0.6rem]">{t.hero.scroll}</span>
        <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
