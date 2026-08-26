import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { adminIsProductionExposed, assertAdminEnabled } from "@/lib/admin";
import { shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Quản lý",
  robots: { index: false, follow: false },
};

const TABS = [
  { href: "/admin", label: "Lịch hẹn" },
  { href: "/admin/services", label: "Dịch vụ" },
  { href: "/admin/barbers", label: "Thợ" },
  { href: "/admin/hours", label: "Giờ mở cửa" },
  { href: "/admin/gallery", label: "Thư viện ảnh" },
] as const;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  assertAdminEnabled();

  return (
    <div className="flex min-h-full flex-col">
      {adminIsProductionExposed() && (
        <p className="flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-xs text-white">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          Trang quản lý đang mở công khai và <strong>không có đăng nhập</strong>. Tắt ADMIN_ENABLED
          hoặc thêm xác thực trước khi dùng thật.
        </p>
      )}

      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="wordmark text-sm text-cream">{shop.name}</p>
            <p className="text-xs text-muted-foreground">Trang quản lý — không đăng nhập</p>
          </div>
          <Link
            href="/"
            className="label text-[0.68rem] text-brass transition-colors hover:text-cream"
          >
            Xem trang chính
          </Link>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5" aria-label="Quản lý">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-brass/40 hover:text-cream"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
      <Toaster position="top-center" />
    </div>
  );
}
