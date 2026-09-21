import type { ReactNode } from "react";
import { Accent } from "@/components/accent";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  /** May carry one `*phrase*` rendered as the italic gold accent. */
  title: string;
  lede?: string;
  align?: "center" | "start";
  /** Sits on the right of the title row, e.g. "Xem tất cả →". */
  aside?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/** The shared section opener: copper mono eyebrow, serif title with its accent, optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "start",
  aside,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Reveal>
        <p className="tag text-brass">{eyebrow}</p>
      </Reveal>

      <Reveal
        delay={1}
        className={cn(
          "flex w-full flex-wrap items-end gap-x-8 gap-y-3",
          align === "center" ? "justify-center" : "justify-between",
        )}
      >
        <h2 className="max-w-3xl text-4xl leading-[1.02] text-cream sm:text-5xl lg:text-[3.25rem]">
          <Accent text={title} />
        </h2>
        {aside}
      </Reveal>

      {lede && (
        <Reveal delay={2}>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>
        </Reveal>
      )}

      {children}
    </div>
  );
}
