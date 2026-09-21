import { Plus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Native `<details>`: keyboard, no JavaScript, and the plus turns when open. */
export function Faq({ t }: { t: Dictionary }) {
  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} align="center" />

        <Reveal delay={1} className="mx-auto mt-14 max-w-3xl border-t border-border">
          {t.faq.items.map((item) => (
            <details key={item.q} className="group border-b border-border">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 font-serif text-xl text-cream transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  className="size-4 shrink-0 text-brass transition-transform duration-300 group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="max-w-2xl pb-6 text-base leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
