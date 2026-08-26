"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { fill, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

type GalleryPhoto = Photo & { id: string };

/** The widest breakpoint. Two columns divides into it, so one trim serves both. */
const GRID_COLUMNS = 4;

/**
 * A masonry-ish grid with a lightbox.
 *
 * The overlay is a native `<dialog>` opened with `showModal()`, which gives the
 * focus trap, the inert background and Escape-to-close for free rather than
 * reimplementing them. Arrow keys step through the set.
 */
export function GalleryGrid({ photos, t }: { photos: GalleryPhoto[]; t: Dictionary }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  // See the grid comment below: one 2x2 feature tile plus square tiles fills
  // whole rows only when `count + 3` divides by the column count.
  const shown = useMemo(() => {
    let count = photos.length;
    while (count > 1 && (count + 3) % GRID_COLUMNS !== 0) count -= 1;
    return photos.slice(0, count);
  }, [photos]);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + shown.length) % shown.length)),
    [shown.length],
  );

  // `showModal` is imperative, so opening and closing is a synchronisation with
  // the DOM — exactly what an effect is for. The backdrop click is bound here
  // too: a click on the backdrop is reported against the dialog element itself,
  // and binding it in the DOM keeps it out of the JSX where it would look like
  // a click handler on non-interactive markup.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();

    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) close();
    };
    dialog.addEventListener("click", onBackdropClick);
    return () => dialog.removeEventListener("click", onBackdropClick);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = index === null ? null : shown[index];

  return (
    <>
      {/*
        A grid that always tiles exactly.

        Row-spans in a grid, and balanced columns in a masonry, both leave a
        ragged bottom edge — the original left an obvious hole under the last
        row. Here every tile is square except one 2x2 feature, and the list is
        trimmed so the cells fill whole rows: the feature occupies 4 cells and
        the rest one each, so `count + 3` has to divide by the column count.
        Satisfying 4 columns satisfies 2 as well, so one trim covers both
        breakpoints.
      */}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {shown.map((photo, i) => (
          <li
            key={photo.id}
            // Every tile carries `aspect-square`, the feature one included. Its
            // contents are absolutely positioned, so without an intrinsic ratio
            // it has no height of its own — and at two columns it spans both
            // columns of the first two rows, leaving no square tile there to
            // give those rows height. It collapsed to 12px on phones.
            className={cn("relative aspect-square", i === 0 && "col-span-2 row-span-2")}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${t.gallery.open}: ${photo.alt}`}
              className="group panel absolute inset-0 cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                placeholder="blur"
                blurDataURL={photo.blur}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-background/10 transition-colors duration-500 group-hover:bg-transparent" />
            </button>
          </li>
        ))}
      </ul>

      {/* Portalled to <body>, and only while open. It has to be portalled: an
          ancestor with a `transform` — which the scroll reveal applies while it
          animates — becomes the containing block for the top layer, so a dialog
          nested inside one is composited into that subtree and inherits its
          opacity. Opening is only ever reached through a click, so there is no
          server render to guard against. */}
      {open &&
        createPortal(
          <dialog
            ref={dialogRef}
            aria-label={t.gallery.title}
            onClose={close}
            className="m-0 h-full max-h-none w-full max-w-none bg-background/97 text-foreground backdrop:bg-background/80"
          >
            {current && (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between px-5 py-4 sm:px-8">
                  <span className="font-mono text-xs text-muted-foreground">
                    {fill(t.gallery.counter, { current: (index ?? 0) + 1, total: shown.length })}
                  </span>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t.gallery.close}
                    className="cursor-pointer p-2 text-cream transition-colors hover:text-brass focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* `fill` rather than intrinsic width/height: as a flex item an
                    intrinsically-sized <img> collapses to zero here, and the set
                    mixes portrait and landscape frames that all have to fit the
                    same box. */}
                <div className="relative min-h-0 flex-1 px-4 pb-4">
                  <Image
                    key={current.id}
                    src={current.src}
                    alt={current.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={current.blur}
                    sizes="90vw"
                    className="object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 px-5 pb-6 sm:px-8">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={t.gallery.prev}
                    className="cursor-pointer p-3 text-cream transition-colors hover:text-brass focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none"
                  >
                    <ChevronLeft className="size-6" />
                  </button>

                  <p className="truncate text-center text-xs text-muted-foreground">
                    {current.alt}
                  </p>

                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={t.gallery.next}
                    className="cursor-pointer p-3 text-cream transition-colors hover:text-brass focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </div>
              </div>
            )}
          </dialog>,
          document.body,
        )}
    </>
  );
}
