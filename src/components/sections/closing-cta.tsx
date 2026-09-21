import { Phone } from "lucide-react";
import { Accent } from "@/components/accent";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { shop } from "@/lib/shop";

/** The last word before the footer: one line, two ways in. */
export function ClosingCta({ t }: { t: Dictionary }) {
  return (
    <section className="glow relative border-t border-border py-24 sm:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
        <Reveal>
          <p className="tag text-brass">{t.cta.eyebrow}</p>
        </Reveal>
        <Reveal delay={1} className="mt-5">
          <h2 className="text-4xl leading-[1.05] text-cream sm:text-5xl">
            <Accent text={t.cta.title} />
          </h2>
        </Reveal>
        <Reveal delay={2} className="mt-5">
          <p className="text-base text-muted-foreground">{t.cta.body}</p>
        </Reveal>
        <Reveal delay={3} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="min-w-40">
            <a href="#booking">{t.cta.book}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${shop.phone}`}>
              <Phone className="size-4" aria-hidden />
              {t.cta.call}
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
