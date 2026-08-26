"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, now } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  type CalendarBooking,
} from "@/lib/calendar";
import {
  getBooking,
  listServices,
  rescheduleBooking,
  setBookingEventId,
  updateBookingStatus,
  type Booking,
} from "@/lib/bookings";
import { barbers } from "@/lib/shop";

const statusSchema = z.enum(["pending", "confirmed", "cancelled", "done"]);

/**
 * `FormData#get` can hand back a `File`, which stringifies to "[object Object]".
 * Every field these forms send is a text input, so anything else is discarded.
 */
function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Assembles what the calendar needs from a stored booking. */
async function toCalendarBooking(booking: Booking): Promise<CalendarBooking> {
  const services = await listServices();
  const service = services.find((s) => s.slug === booking.serviceSlug);
  const barber = barbers.find((b) => b.slug === booking.barberSlug);

  return {
    id: booking.id,
    name: booking.customerName,
    phone: booking.customerPhone,
    barberName: barber?.nameVi ?? booking.barberSlug,
    note: booking.note,
    service,
    serviceSlug: booking.serviceSlug,
    date: booking.requestedDate,
    time: booking.requestedTime,
    // Fall back to an hour when the service is unknown, so a stray slug still
    // produces a sanely-sized block on the calendar rather than a zero-length one.
    minutes: service?.minutes ?? 60,
  };
}

/**
 * Reconciles the shop's calendar with a booking's current state.
 *
 * Confirmed bookings should have exactly one event; anything else should have
 * none. Calling this after every status change means the calendar converges on
 * the right answer no matter which order staff press things in — confirm,
 * cancel, reopen, confirm again.
 *
 * Every failure is swallowed. The booking is already committed and visible in
 * /admin; a calendar that is temporarily out of step is not worth losing a
 * customer's appointment over.
 */
async function syncCalendar(id: number): Promise<void> {
  const booking = await getBooking(id);
  if (!booking) return;

  const shouldHaveEvent = booking.status === "confirmed";

  if (!shouldHaveEvent) {
    if (booking.googleEventId) {
      await deleteCalendarEvent(booking.googleEventId);
      await setBookingEventId(id, null);
    }
    return;
  }

  const details = await toCalendarBooking(booking);

  if (booking.googleEventId) {
    const moved = await updateCalendarEvent(booking.googleEventId, details);
    // A 404/410 means the event was deleted in Google directly; drop the stale
    // id so the next confirm creates a fresh one instead of patching a ghost.
    if (!moved) await setBookingEventId(id, null);
    return;
  }

  const eventId = await createCalendarEvent(details);
  if (eventId) await setBookingEventId(id, eventId);
}

/**
 * Every action re-checks the gate. The page check alone is not enough — Server
 * Actions are their own endpoints and can be called without rendering the page.
 */

export async function setBookingStatus(formData: FormData): Promise<void> {
  assertAdminEnabled();

  const id = Number(formData.get("id"));
  const status = statusSchema.safeParse(formData.get("status"));
  const staffNote = readString(formData, "staffNote").trim();

  if (!Number.isInteger(id) || !status.success) return;

  await updateBookingStatus(id, status.data, staffNote || undefined);
  await syncCalendar(id);
  revalidatePath("/admin");
}

export async function rescheduleBookingAction(formData: FormData): Promise<void> {
  assertAdminEnabled();

  const id = Number(formData.get("id"));
  const date = readString(formData, "date");
  const time = readString(formData, "time");
  const staffNote = readString(formData, "staffNote").trim();

  const valid =
    Number.isInteger(id) && /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time);
  if (!valid) return;

  // Rescheduling confirms as a side effect, so the event is created here if it
  // did not exist yet, and moved if it did.
  await rescheduleBooking(id, date, time, staffNote || undefined);
  await syncCalendar(id);
  revalidatePath("/admin");
}

const priceSchema = z.coerce.number().int().min(0).max(100_000_000);

export async function updateService(formData: FormData): Promise<void> {
  assertAdminEnabled();

  const slug = readString(formData, "slug");
  const nameVi = readString(formData, "nameVi").trim();
  const nameEn = readString(formData, "nameEn").trim();
  const price = priceSchema.safeParse(formData.get("price"));
  const minutes = z.coerce.number().int().min(5).max(480).safeParse(formData.get("minutes"));
  const isActive = formData.get("isActive") === "on" ? 1 : 0;

  if (!slug || !nameVi || !nameEn || !price.success || !minutes.success) return;

  await getDb()
    .updateTable("services")
    .set({
      name_vi: nameVi,
      name_en: nameEn,
      price: price.data,
      minutes: minutes.data,
      is_active: isActive,
    })
    .where("slug", "=", slug)
    .execute();

  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function updateBarber(formData: FormData): Promise<void> {
  assertAdminEnabled();

  const slug = readString(formData, "slug");
  const nameVi = readString(formData, "nameVi").trim();
  const nameEn = readString(formData, "nameEn").trim();
  const isActive = formData.get("isActive") === "on" ? 1 : 0;

  if (!slug || !nameVi || !nameEn) return;

  await getDb()
    .updateTable("barbers")
    .set({ name_vi: nameVi, name_en: nameEn, is_active: isActive })
    .where("slug", "=", slug)
    .execute();

  revalidatePath("/admin/barbers");
  revalidatePath("/");
}

const hoursSchema = z.array(
  z.object({
    day: z.number().int().min(0).max(6),
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
  }),
);

export async function updateHours(formData: FormData): Promise<void> {
  assertAdminEnabled();

  const hours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: readString(formData, `open-${day}`),
    close: readString(formData, `close-${day}`),
  }));

  const parsed = hoursSchema.safeParse(hours);
  if (!parsed.success) return;

  const value = JSON.stringify(parsed.data);
  await getDb()
    .insertInto("shop_settings")
    .values({ key: "hours", value, updated_at: now() })
    .onConflict((oc) => oc.column("key").doUpdateSet({ value, updated_at: now() }))
    .execute();

  revalidatePath("/admin/hours");
  revalidatePath("/");
}

export async function toggleGalleryPhoto(formData: FormData): Promise<void> {
  assertAdminEnabled();

  const photoId = readString(formData, "photoId");
  const visible = formData.get("visible") === "true" ? 1 : 0;
  if (!photoId) return;

  await getDb()
    .insertInto("gallery_photos")
    .values({ photo_id: photoId, rank: 0, is_visible: visible })
    .onConflict((oc) => oc.column("photo_id").doUpdateSet({ is_visible: visible }))
    .execute();

  revalidatePath("/admin/gallery");
  revalidatePath("/");
}
