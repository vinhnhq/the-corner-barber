import { GalleryGrid } from "@/components/gallery-grid";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { photos, photosInSlot, type PhotoId } from "@/lib/photos";

/** The order a visitor takes the room in: the space, then its details, then the work. */
function defaultSelection() {
  return [
    ...photosInSlot("interior"),
    ...photosInSlot("detail"),
    ...photosInSlot("craft").slice(0, 6),
  ];
}

export function Gallery({ t, photoIds }: { t: Dictionary; photoIds: string[] | null }) {
  const pictures =
    photoIds === null
      ? defaultSelection()
      : photoIds.filter((id): id is PhotoId => id in photos).map((id) => ({ ...photos[id], id }));

  if (pictures.length === 0) return null;

  return (
    <section
      id="gallery"
      className="scroll-mt-20 border-y border-border/60 bg-card/25 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} lede={t.gallery.lede} />

        <Reveal delay={1} className="mt-16">
          <GalleryGrid photos={pictures} t={t} />
        </Reveal>
      </div>
    </section>
  );
}
