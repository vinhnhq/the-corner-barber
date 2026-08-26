import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger step for siblings: 0, 1, 2… Each step delays the reveal slightly. */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Fades content up as it scrolls into view.
 *
 * This is CSS scroll-driven animation (`animation-timeline: view()`), not an
 * IntersectionObserver, and deliberately so: the content is **visible by
 * default** and the animation is layered on top only where the browser supports
 * it and the visitor has not asked for reduced motion. A JavaScript reveal that
 * fails leaves the page blank — this one cannot, because there is no JavaScript
 * and the hidden state only ever exists inside the `@supports` block.
 *
 * It is also a Server Component, so none of this ships to the browser.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  return (
    <Tag
      className={cn("reveal", className)}
      style={delay ? ({ "--reveal-step": delay } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * The brass hairline between sections, with a diamond at its centre — the
 * divider used on the shop's own price board.
 */
export function BrassRule({ className, label }: { className?: string; label?: ReactNode }) {
  return (
    <div className={cn("brass-rule", className)} aria-hidden={label ? undefined : true}>
      {label ? (
        <span className="label text-[0.7rem] text-brass-dim">{label}</span>
      ) : (
        <span className="block size-1.5 rotate-45 bg-brass-dim" />
      )}
    </div>
  );
}
