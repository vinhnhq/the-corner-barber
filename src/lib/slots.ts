/**
 * The bookable grid of times.
 *
 * Shared so the form and the availability check cannot drift apart — if these
 * two disagreed, the form would offer a slot the server considers nonexistent.
 */

/** Half-hour steps across the shop's widest opening window. */
export const SLOT_STEP_MINUTES = 30;
const FIRST_SLOT = 8 * 60 + 30;
const LAST_SLOT = 20 * 60 + 30;

export function minutesToTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function slotTimes(): string[] {
  const slots: string[] = [];
  for (let m = FIRST_SLOT; m <= LAST_SLOT; m += SLOT_STEP_MINUTES) slots.push(minutesToTime(m));
  return slots;
}

/** How far ahead the shop takes bookings. */
export const BOOKABLE_DAYS = 30;

export type DateOption = { value: string; label: string };

/**
 * The selectable dates, formatted for display.
 *
 * The form uses a list of days rather than `<input type="date">`. The native
 * control is inconsistent across platforms — on iOS Safari it renders no
 * calendar indicator at all, so it reads as a dead text box next to the fields
 * that do have one, and its picker behaviour cannot be verified from here. A
 * plain select behaves identically everywhere, matches the time field beside
 * it, and a barbershop has no reason to take bookings a year out anyway.
 *
 * Generated on the server and passed down, so the labels cannot differ between
 * the server render and the client's locale.
 */
export function bookableDates(from: string, locale: string, days = BOOKABLE_DAYS): DateOption[] {
  const formatter = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  // Anchored at midday so a day-step can never fall across a DST edge in some
  // other zone and land back on the same date.
  const start = new Date(`${from}T12:00:00+07:00`);

  return Array.from({ length: days }, (_, offset) => {
    const day = new Date(start.getTime() + offset * 86_400_000);
    const value = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(day);

    return { value, label: formatter.format(day) };
  });
}
