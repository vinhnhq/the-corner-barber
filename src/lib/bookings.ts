import "server-only";
import { z } from "zod";
import { db, now } from "@/db/client";
import type { BookingStatus } from "@/db/schema";
import { services as fallbackServices, type Service } from "@/lib/shop";

/**
 * Vietnamese mobile numbers: 10 digits starting `0`, or the same number written
 * with the `+84`/`84` country code. Everything is stored in the `0…` form so
 * two spellings of one number are one customer.
 */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("84") ? `0${digits.slice(2)}` : digits;
  return /^0\d{9}$/.test(local) ? local : null;
}

export const bookingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const normalised = normalisePhone(value);
      if (normalised === null) {
        ctx.addIssue({ code: "custom", message: "invalid_phone" });
        return z.NEVER;
      }
      return normalised;
    }),
  service: z.string().trim().min(1).max(64),
  barber: z.string().trim().min(1).max(64).default("any"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  /** Hidden field. A real person leaves it empty; most bots fill it in. */
  website: z.string().max(0).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Reads the menu from the database, falling back to the static list. */
export async function listServices(): Promise<Service[]> {
  try {
    const rows = await db
      .selectFrom("services")
      .selectAll()
      .where("is_active", "=", 1)
      .orderBy("group_name")
      .orderBy("rank")
      .execute();

    if (rows.length === 0) return fallbackServices;

    return rows.map((row) => ({
      slug: row.slug,
      group: row.group_name,
      rank: row.rank,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      price: row.price,
      wasPrice: row.was_price,
      minutes: row.minutes,
      includesVi: JSON.parse(row.includes_vi) as string[],
      includesEn: JSON.parse(row.includes_en) as string[],
    }));
  } catch {
    // A missing local database should degrade to the static menu rather than
    // blanking the page — the prices are the same either way.
    return fallbackServices;
  }
}

export async function listBarbers() {
  return db.selectFrom("barbers").selectAll().where("is_active", "=", 1).orderBy("rank").execute();
}

const RATE_LIMIT_WINDOW_MINUTES = 5;

/** True when this phone number already sent a request very recently. */
export async function isRateLimited(phone: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

  const recent = await db
    .selectFrom("bookings")
    .select("id")
    .where("customer_phone", "=", phone)
    .where("created_at", ">", since)
    .limit(1)
    .executeTakeFirst();

  return recent !== undefined;
}

export async function createBooking(input: BookingInput): Promise<number> {
  const timestamp = now();

  const inserted = await db
    .insertInto("bookings")
    .values({
      customer_name: input.name,
      customer_phone: input.phone,
      service_slug: input.service,
      barber_slug: input.barber,
      requested_date: input.date,
      requested_time: input.time,
      note: input.note ? input.note : null,
      status: "pending",
      staff_note: null,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return inserted.id;
}

/** A booking as the UI consumes it — a plain object, safe to hand to a Client
 *  Component. The driver's row objects are not plain and React rejects them. */
export type Booking = {
  id: number;
  customerName: string;
  customerPhone: string;
  serviceSlug: string;
  barberSlug: string;
  requestedDate: string;
  requestedTime: string;
  note: string | null;
  status: BookingStatus;
  staffNote: string | null;
  googleEventId: string | null;
  createdAt: string;
};

export async function listBookings(status?: BookingStatus): Promise<Booking[]> {
  let query = db.selectFrom("bookings").selectAll().orderBy("created_at", "desc").limit(200);
  if (status) query = query.where("status", "=", status);

  const rows = await query.execute();

  return rows.map((row) => ({
    id: Number(row.id),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    serviceSlug: row.service_slug,
    barberSlug: row.barber_slug,
    requestedDate: row.requested_date,
    requestedTime: row.requested_time,
    note: row.note,
    status: row.status,
    staffNote: row.staff_note,
    googleEventId: row.google_event_id,
    createdAt: row.created_at,
  }));
}

/** One booking, as a plain object. Null when the id does not exist. */
export async function getBooking(id: number): Promise<Booking | null> {
  const row = await db.selectFrom("bookings").selectAll().where("id", "=", id).executeTakeFirst();

  if (!row) return null;

  return {
    id: Number(row.id),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    serviceSlug: row.service_slug,
    barberSlug: row.barber_slug,
    requestedDate: row.requested_date,
    requestedTime: row.requested_time,
    note: row.note,
    status: row.status,
    staffNote: row.staff_note,
    googleEventId: row.google_event_id,
    createdAt: row.created_at,
  };
}

export async function setBookingEventId(id: number, eventId: string | null): Promise<void> {
  await db.updateTable("bookings").set({ google_event_id: eventId }).where("id", "=", id).execute();
}

export async function countBookingsByStatus(): Promise<Record<BookingStatus, number>> {
  const rows = await db
    .selectFrom("bookings")
    .select(["status", db.fn.countAll<number>().as("count")])
    .groupBy("status")
    .execute();

  const counts: Record<BookingStatus, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    done: 0,
  };
  for (const row of rows) counts[row.status] = Number(row.count);
  return counts;
}

export async function updateBookingStatus(
  id: number,
  status: BookingStatus,
  staffNote?: string,
): Promise<void> {
  await db
    .updateTable("bookings")
    .set({
      status,
      staff_note: staffNote ?? null,
      updated_at: now(),
    })
    .where("id", "=", id)
    .execute();
}

export async function rescheduleBooking(
  id: number,
  date: string,
  time: string,
  staffNote?: string,
): Promise<void> {
  await db
    .updateTable("bookings")
    .set({
      requested_date: date,
      requested_time: time,
      status: "confirmed",
      staff_note: staffNote ?? null,
      updated_at: now(),
    })
    .where("id", "=", id)
    .execute();
}

/**
 * The gallery selection the admin controls. Falls back to the manifest order
 * when nothing has been chosen yet, so the section is never empty.
 */
export async function listGalleryPhotoIds(): Promise<string[] | null> {
  try {
    const rows = await db
      .selectFrom("gallery_photos")
      .select("photo_id")
      .where("is_visible", "=", 1)
      .orderBy("rank")
      .execute();

    return rows.length > 0 ? rows.map((r) => r.photo_id) : null;
  } catch {
    return null;
  }
}
