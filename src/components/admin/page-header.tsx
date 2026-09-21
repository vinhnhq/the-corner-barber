import type { ReactNode } from "react";

/** Every admin page opens the same way: serif title, one line of context, optional actions. */
export function PageHeader({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl text-cream">{title}</h1>
        {lede && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{lede}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** A titled group within a page: mono tag, optional line, then its content. */
export function AdminSection({
  title,
  lede,
  aside,
  children,
}: {
  title: string;
  lede?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="tag text-brass">{title}</h2>
          {lede && <p className="mt-1.5 text-sm text-muted-foreground">{lede}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
