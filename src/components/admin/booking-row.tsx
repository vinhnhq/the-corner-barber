"use client";

import { useState, type ReactNode } from "react";
import { Calendar, Check, Phone, RotateCcw, X } from "lucide-react";
import { rescheduleBookingAction, setBookingStatus } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookingStatus } from "@/db/schema";
import type { Booking } from "@/lib/bookings";
import { cn } from "@/lib/utils";

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-warning/15 text-warning border-warning/30" },
  confirmed: { label: "Đã xác nhận", className: "bg-success/15 text-success border-success/30" },
  done: { label: "Đã xong", className: "bg-brass/15 text-brass border-brass/30" },
  cancelled: {
    label: "Đã huỷ",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

/**
 * One request, with the three things staff actually do to it: confirm, move to
 * another time, or cancel. Each is a plain form posting a Server Action, so the
 * row still works if the page's JavaScript never arrives.
 */
export function BookingRow({
  booking,
  serviceName,
  barberName,
}: {
  booking: Booking;
  serviceName: string;
  /** Resolved by the page — the row only ever holds the slug. */
  barberName: string;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const status = STATUS[booking.status];

  return (
    <li className="panel flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2 text-cream">
            <span className="font-medium">{booking.customerName}</span>
            <span className="font-mono text-xs text-muted-foreground">#{booking.id}</span>
          </p>
          <a
            href={`tel:${booking.customerPhone}`}
            className="flex items-center gap-1.5 font-mono text-sm text-brass transition-colors hover:text-cream"
          >
            <Phone className="size-3.5" aria-hidden />
            {booking.customerPhone}
          </a>
        </div>

        <Badge variant="outline" className={cn("shrink-0", status.className)}>
          {status.label}
        </Badge>
      </div>

      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Dịch vụ</dt>
          <dd className="text-cream">{serviceName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Thợ</dt>
          <dd className="text-cream">{barberName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Thời gian mong muốn</dt>
          <dd className="font-mono text-cream">
            {booking.requestedDate} · {booking.requestedTime}
          </dd>
        </div>
      </dl>

      {booking.note && (
        <p className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
          {booking.note}
        </p>
      )}

      {booking.staffNote && (
        <p className="border-l-2 border-brass/40 pl-3 text-sm text-brass-dim">
          Ghi chú tiệm: {booking.staffNote}
        </p>
      )}

      {rescheduling ? (
        <form
          action={rescheduleBookingAction}
          className="flex flex-wrap items-end gap-3 border-t border-border/60 pt-4"
        >
          <input type="hidden" name="id" value={booking.id} />
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Ngày mới
            <Input type="date" name="date" defaultValue={booking.requestedDate} required />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Giờ mới
            <Input type="time" name="time" defaultValue={booking.requestedTime} required />
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            Ghi chú
            <Input name="staffNote" placeholder="Đã gọi khách, dời sang…" />
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Lưu
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRescheduling(false)}>
              Huỷ
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {booking.status !== "confirmed" && (
            <StatusButton id={booking.id} status="confirmed" icon={<Check className="size-3.5" />}>
              Xác nhận
            </StatusButton>
          )}

          <Button type="button" size="sm" variant="outline" onClick={() => setRescheduling(true)}>
            <Calendar className="size-3.5" aria-hidden />
            Đổi giờ
          </Button>

          {booking.status !== "done" && (
            <StatusButton id={booking.id} status="done" icon={<Check className="size-3.5" />}>
              Đã xong
            </StatusButton>
          )}

          {booking.status !== "cancelled" ? (
            <StatusButton
              id={booking.id}
              status="cancelled"
              variant="ghost"
              icon={<X className="size-3.5" />}
            >
              Huỷ
            </StatusButton>
          ) : (
            <StatusButton
              id={booking.id}
              status="pending"
              variant="ghost"
              icon={<RotateCcw className="size-3.5" />}
            >
              Mở lại
            </StatusButton>
          )}
        </div>
      )}
    </li>
  );
}

function StatusButton({
  id,
  status,
  icon,
  children,
  variant = "secondary",
}: {
  id: number;
  status: BookingStatus;
  icon: ReactNode;
  children: ReactNode;
  variant?: "secondary" | "outline" | "ghost";
}) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>
        {icon}
        {children}
      </Button>
    </form>
  );
}
