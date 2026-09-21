"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A destructive submit that asks for a second tap instead of a dialog. A
 * browser `confirm()` blocks the whole page and reads as a desktop control
 * on a phone; the armed state resets itself after a moment.
 */
export function ConfirmButton({
  children,
  confirmLabel,
  className,
}: {
  children: ReactNode;
  confirmLabel: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <button type="submit" className={cn(className, "bg-destructive/20 text-destructive")}>
      {confirmLabel}
    </button>
  );
}
