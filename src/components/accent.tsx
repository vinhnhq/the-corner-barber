import { Fragment, type ReactNode } from "react";

/**
 * Renders a dictionary string with one or more `*phrase*` spans as the italic
 * gold accent — the one flourish every display heading gets.
 */
export function Accent({ text }: { text: string }): ReactNode {
  const parts = text.split("*");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="accent">
        {part}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
