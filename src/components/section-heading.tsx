import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "center" | "start";
  className?: string;
  children?: ReactNode;
};

/** The shared section opener: brass eyebrow, serif title, optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
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
        <p className="label text-[0.68rem] text-brass">{eyebrow}</p>
      </Reveal>

      <Reveal delay={1}>
        <h2 className="max-w-3xl font-heading text-3xl leading-tight text-cream sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>

      {lede && (
        <Reveal delay={2}>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{lede}</p>
        </Reveal>
      )}

      {children}
    </div>
  );
}
