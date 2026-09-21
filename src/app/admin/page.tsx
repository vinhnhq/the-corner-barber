import { BookingRow } from "@/components/admin/booking-row";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/db/schema";
import { assertAdminEnabled } from "@/lib/admin";
import { calendarIsConfigured } from "@/lib/calendar";
import { countBookingsByStatus, listBarbers, listBookings, listServices } from "@/lib/bookings";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã huỷ",
  done: "Đã xong",
};

const FILTERS = ["all", "pending", "confirmed", "done", "cancelled"] as const;

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin">) {
  assertAdminEnabled();

  const params = await searchParams;
  const raw = typeof params.status === "string" ? params.status : "all";
  const filter = (FILTERS as readonly string[]).includes(raw) ? raw : "all";

  const [bookings, counts, services, barbers] = await Promise.all([
    listBookings(filter === "all" ? undefined : (filter as BookingStatus)),
    countBookingsByStatus(),
    listServices(),
    listBarbers().catch(() => []),
  ]);

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Lịch hẹn" lede={`${counts.pending} chờ xác nhận, ${total} tổng cộng.`}>
        {/* Staff need to know whether confirming will actually reach the
            calendar, rather than discovering later that it never did. */}
        <Badge
          variant="outline"
          className={cn(
            "tag text-[0.6rem]",
            calendarIsConfigured()
              ? "border-success/30 bg-success/15 text-success"
              : "border-border text-muted-foreground",
          )}
        >
          {calendarIsConfigured() ? "Google Calendar: đang bật" : "Google Calendar: chưa cấu hình"}
        </Badge>
      </PageHeader>

      <nav className="flex flex-wrap gap-2" aria-label="Lọc theo trạng thái">
        {FILTERS.map((value) => {
          const active = value === filter;
          const count = value === "all" ? total : counts[value as BookingStatus];
          return (
            <Link
              key={value}
              href={value === "all" ? "/admin" : `/admin?status=${value}`}
              className={cn(
                "tag inline-flex min-h-11 items-center border px-3 text-[0.6rem] transition-colors sm:min-h-9",
                active
                  ? "border-brass/60 bg-brass/10 text-brass"
                  : "border-border text-muted-foreground hover:text-cream",
              )}
            >
              {value === "all" ? "Tất cả" : STATUS_LABEL[value as BookingStatus]} ({count})
            </Link>
          );
        })}
      </nav>

      {bookings.length === 0 ? (
        <p className="surface px-6 py-16 text-center text-sm text-muted-foreground">
          Chưa có yêu cầu nào.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              serviceName={
                services.find((s) => s.slug === booking.serviceSlug)?.nameVi ?? booking.serviceSlug
              }
              barberName={
                barbers.find((b) => b.slug === booking.barberSlug)?.name_vi ?? booking.barberSlug
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
