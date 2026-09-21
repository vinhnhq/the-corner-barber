"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * The hero background loop.
 *
 * The clip is tens of MB, too much to push at everyone, so the `<source>` is
 * attached only when the visit passes two tests: no `prefers-reduced-motion`,
 * and no `saveData`/2g connection hint. Phones do get it — the shop's clip is
 * portrait and the hero is the first thing a visitor sees — but anyone who has
 * asked for less keeps the poster still, which is the same frame, so the
 * layout and the first paint are identical either way.
 *
 * The decision goes through `useSyncExternalStore` rather than an effect: the
 * server snapshot is "no video", the client subscribes to the media queries,
 * and React reconciles the difference without a cascading render.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function shouldPlay(): boolean {
  if (window.matchMedia(REDUCED).matches) return false;

  // `connection` is Chromium-only; absence just means "no reason to hold back".
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;

  if (connection?.saveData === true) return false;
  if (connection?.effectiveType !== undefined && /^(slow-)?2g$/.test(connection.effectiveType)) {
    return false;
  }

  return true;
}

export function HeroVideo({ poster, src }: { poster: string | undefined; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const active = useSyncExternalStore(subscribe, shouldPlay, () => false);

  useEffect(() => {
    if (!active) return;
    const video = ref.current;
    if (!video) return;

    video.load();
    // Autoplay can still be refused; the poster stays visible if it is.
    void video.play().catch(() => undefined);
  }, [active]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className="size-full object-cover object-center"
    >
      {active && <source src={src} type="video/mp4" />}
    </video>
  );
}
