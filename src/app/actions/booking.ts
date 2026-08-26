"use server";

import { revalidatePath } from "next/cache";
import { bookingSchema, createBooking, isRateLimited, listServices } from "@/lib/bookings";
import { notifyNewBooking } from "@/lib/notify";
import { barbers } from "@/lib/shop";

/** What the success screen needs to offer an "add to your calendar" link. */
export type ConfirmedAppointment = {
  date: string;
  time: string;
  minutes: number;
  serviceName: string;
};

export type BookingResult =
  | { ok: true; id: number; phone: string; appointment: ConfirmedAppointment | null }
  | { ok: false; error: "validation" | "rate_limited" | "server"; fields?: Record<string, string> };

/**
 * Takes a booking request from the public form.
 *
 * A request is never rejected for being an awkward time — the shop decides that
 * when it confirms. The only refusals here are malformed input, an obvious bot
 * (the honeypot), and the same phone number submitting twice in five minutes.
 */
export async function submitBooking(formData: FormData): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    service: formData.get("service") ?? "",
    barber: formData.get("barber") ?? "any",
    date: formData.get("date") ?? "",
    time: formData.get("time") ?? "",
    note: formData.get("note") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fields)) fields[key] = issue.message;
    }
    return { ok: false, error: "validation", fields };
  }

  const input = parsed.data;

  // The honeypot is a hidden field; anything in it came from a script. The
  // response is indistinguishable from success so the bot learns nothing.
  if (input.website) return { ok: true, id: 0, phone: input.phone, appointment: null };

  try {
    if (await isRateLimited(input.phone)) {
      return { ok: false, error: "rate_limited" };
    }

    const id = await createBooking(input);

    const services = await listServices();
    const service = services.find((s) => s.slug === input.service);
    const barber = barbers.find((b) => b.slug === input.barber);

    await notifyNewBooking({
      id,
      name: input.name,
      phone: input.phone,
      date: input.date,
      time: input.time,
      barber: barber?.nameVi ?? input.barber,
      note: input.note || undefined,
      service,
      serviceSlug: input.service,
    });

    revalidatePath("/admin");

    return {
      ok: true,
      id,
      phone: input.phone,
      appointment: service
        ? {
            date: input.date,
            time: input.time,
            minutes: service.minutes,
            serviceName: service.nameVi,
          }
        : null,
    };
  } catch (error) {
    console.error("[booking] failed to record request", error);
    return { ok: false, error: "server" };
  }
}
