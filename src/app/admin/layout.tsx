import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Toaster } from "@/components/ui/sonner";
import { adminIsProductionExposed, assertAdminEnabled } from "@/lib/admin";
import { shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Quản lý",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  assertAdminEnabled();

  return (
    <div data-admin className="flex min-h-full flex-col">
      {adminIsProductionExposed() && (
        <p className="flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-xs text-white">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          Trang quản lý đang chạy trên bản triển khai, chỉ được bảo vệ bằng{" "}
          <strong>mật khẩu dùng chung</strong> — chưa có tài khoản đăng nhập riêng.
        </p>
      )}

      <header className="flex flex-col gap-2 pb-2">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="tag text-cream">{shop.name}</p>
            <p className="text-xs text-muted-foreground">Trang quản lý</p>
          </div>
          <Link href="/" className="tag text-brass transition-colors hover:text-cream md:hidden">
            Xem trang web
          </Link>
        </div>
        <AdminNav />
      </header>

      {/* Bottom padding clears the phone dock. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-6 pb-28 md:pb-12">{children}</main>
      <Toaster position="top-center" />
    </div>
  );
}
