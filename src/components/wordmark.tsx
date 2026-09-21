import Image from "next/image";
import { shop } from "@/lib/shop";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  /** `full` adds the EST. line, as on the gold wall sign. */
  variant?: "compact" | "full";
  /** Show the barber-pole mark alongside the name. */
  withMark?: boolean;
};

/**
 * The shop's name in tracked serif caps over a mono line, with the founding
 * year beneath in the `full` variant — the same two faces as the page, so the
 * lockup reads as part of it.
 *
 * The mark is decorative — `alt=""` — because the name is right next to it in
 * real text. Announcing "barber pole" before "The Corner" would only add noise
 * for anyone using a screen reader.
 */
export function Wordmark({ className, variant = "compact", withMark = false }: WordmarkProps) {
  const lockup = (
    <span className="inline-flex flex-col items-center leading-none uppercase">
      <span className="font-serif text-[1em] font-semibold tracking-[0.2em] text-cream">
        {shop.name}
      </span>
      <span className="mt-[0.45em] font-mono text-[0.36em] tracking-[0.34em] text-brass">
        {shop.suffix}
      </span>
      {variant === "full" && (
        <span className="mt-[0.6em] font-mono text-[0.32em] tracking-[0.34em] text-dim">
          Est. {shop.established}
        </span>
      )}
    </span>
  );

  if (!withMark) {
    return (
      <span className={cn("inline-flex flex-col items-center leading-none", className)}>
        {lockup}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center",
        // Beside the name in the header, above it in the footer's stacked lockup.
        variant === "full" ? "flex-col gap-[0.5em]" : "gap-[0.55em]",
        className,
      )}
    >
      <Image
        src="/icons/mark.png"
        alt=""
        width={110}
        height={256}
        priority
        className={cn("w-auto", variant === "full" ? "h-[2em]" : "h-[1.9em]")}
      />
      {lockup}
    </span>
  );
}
