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
