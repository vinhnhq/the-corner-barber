"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ExternalLink,
  Image as ImageIcon,
  LayoutTemplate,
  Scissors,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Lịch hẹn", icon: CalendarCheck },
  { href: "/admin/pages", label: "Trang chính", icon: LayoutTemplate },
  { href: "/admin/media", label: "Thư viện", icon: ImageIcon },
  { href: "/admin/services", label: "Dịch vụ", icon: Scissors },
  { href: "/admin/shop", label: "Tiệm", icon: Store },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * One nav, two shapes. On a phone it is a dock along the bottom — where the
 * thumb is — with the five staff pages; from `md` it is a row of tabs under
 * the header. The dock sits above the home indicator via `safe-area-inset`.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden md:block" aria-label="Quản lý">
        <ul className="mx-auto flex max-w-6xl gap-1 px-5">
          {TABS.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive(pathname, tab.href) ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  isActive(pathname, tab.href)
                    ? "bg-card text-cream"
                    : "text-muted-foreground hover:text-cream",
                )}
              >
                <tab.icon className="size-4" aria-hidden />
                {tab.label}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-brass transition-colors hover:text-cream"
            >
              <ExternalLink className="size-4" aria-hidden />
              Xem trang web
            </Link>
          </li>
        </ul>
      </nav>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 bg-background/90 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Quản lý"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.7rem] transition-colors",
                    active ? "text-brass" : "text-muted-foreground",
                  )}
                >
                  <tab.icon className="size-5" aria-hidden />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
