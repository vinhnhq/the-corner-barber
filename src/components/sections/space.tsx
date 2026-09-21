import { GalleryGrid } from "@/components/gallery-grid";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Media } from "@/lib/media";

export function Space({ t, media }: { t: Dictionary; media: Media[] }) {
  if (media.length === 0) return null;

  return (
    <section id="space" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.space.eyebrow} title={t.space.title} lede={t.space.lede}>
          <Reveal delay={3}>
            {/* Three facts of one kind: side by side with a wide gap, no dots. */}
            <ul className="tag flex flex-wrap gap-x-8 gap-y-2 text-brass">
              {t.space.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Reveal>
        </SectionHeading>

        <Reveal delay={1} className="mt-16">
          <GalleryGrid photos={media} t={t} />
        </Reveal>
      </div>
    </section>
  );
}
