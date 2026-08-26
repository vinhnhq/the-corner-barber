/**
 * Turning a stored booking into wall-clock and UTC instants.
 *
 * Bookings are stored as the date and time on the wall in the shop —
 * `2026-08-25` + `09:00` — with no offset, because that is what the customer
 * and the barber both mean. Vietnam is UTC+7 all year and has observed no
 * daylight saving since 1975, so a fixed offset is exact here rather than an
 * approximation. That is the only reason this file can be this simple; it would
 * not be safe in a country with DST.
 */

export const SHOP_TIME_ZONE = "Asia/Ho_Chi_Minh";
const OFFSET_HOURS = 7;

export type Appointment = {
  /** `YYYY-MM-DD` in shop time. */
  date: string;
  /** `HH:MM` in shop time. */
  time: string;
  /** Chair time in minutes. */
  minutes: number;
};

/** The instant an appointment starts, as a real `Date`. */
export function startsAt({ date, time }: Pick<Appointment, "date" | "time">): Date {
  return new Date(`${date}T${time}:00+0${OFFSET_HOURS}:00`);
}

export function endsAt(appointment: Appointment): Date {
  return new Date(startsAt(appointment).getTime() + appointment.minutes * 60_000);
}

/** `2026-08-25T09:00:00` — local wall time, no offset. What Google's
 *  `dateTime` field expects when it is paired with an explicit `timeZone`. */
export function toLocalIso({ date, time }: Pick<Appointment, "date" | "time">): string {
  return `${date}T${time}:00`;
}

export function endLocalIso(appointment: Appointment): string {
  const end = endsAt(appointment);
  // Read the parts back out in shop time rather than the server's zone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(end);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00`;
}

/** `20260825T020000Z` — the basic UTC form used by .ics and calendar URLs. */
export function toUtcBasic(instant: Date): string {
  return `${instant.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** Minutes since midnight, right now, on the clock in the shop. */
export function shopNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return get("hour") * 60 + get("minute");
}
