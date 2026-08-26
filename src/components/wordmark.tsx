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
 * The shop's name, set the way it is cut into the shopfront glass: engraved
 * caps, a brass rule, and the founding year beneath.
 *
 * The mark is decorative — `alt=""` — because the name is right next to it in
 * real text. Announcing "barber pole" before "The Corner" would only add noise
 * for anyone using a screen reader.
 */
export function Wordmark({ className, variant = "compact", withMark = false }: WordmarkProps) {
  const lockup = (
    <span className="inline-flex flex-col items-center leading-none">
      <span className="wordmark text-[1.05em] font-semibold text-cream">{shop.name}</span>
      <span
        className={cn(
          "wordmark mt-[0.35em] text-[0.42em] font-normal text-brass",
          variant === "full" && "text-[0.4em]",
        )}
      >
        {shop.suffix}
      </span>
      {variant === "full" && (
        <span className="mt-[0.55em] flex items-center gap-[0.5em] text-[0.34em] text-brass-dim">
          <span className="h-px w-[1.6em] bg-brass-dim" />
          <span className="wordmark">Est. {shop.established}</span>
          <span className="h-px w-[1.6em] bg-brass-dim" />
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
