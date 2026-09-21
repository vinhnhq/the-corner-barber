import { Check, MessageCircle, Scissors, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const ICONS = [MessageCircle, Scissors, Sparkles, Check] as const;

/**
 * The four steps of a visit on one rail: icon discs on a hairline, a big
 * faint numeral behind each, serif title, one line of sans.
 */
export function Experience({ t }: { t: Dictionary }) {
  return (
    <section id="experience" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.experience.eyebrow} title={t.experience.title} />

        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* The rail: behind the discs from `lg`, where the steps sit in one row. */}
          <span
            aria-hidden
            className="absolute top-5 right-0 left-0 hidden h-px bg-border lg:block"
          />
          {t.experience.steps.map((step, i) => {
            const Icon = ICONS[i] ?? Check;
            return (
              <Reveal key={step.title} delay={i} as="li" className="relative flex flex-col gap-4">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 right-2 font-serif text-8xl leading-none text-cream/[0.05] select-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative flex size-10 items-center justify-center rounded-full border border-brass/70 bg-background text-brass">
                  <Icon className="size-4" aria-hidden />
                </span>
                <h3 className="text-2xl text-cream">{step.title}</h3>
                <p className="max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
