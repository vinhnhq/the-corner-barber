import "server-only";
import { getDb } from "@/db/client";
import { listBarbers, listServices } from "@/lib/bookings";
import { shopNowMinutes } from "@/lib/appointment-time";
import { slotTimes, timeToMinutes } from "@/lib/slots";
import { shopToday } from "@/lib/shop";

/**
 * Which times are no longer offerable on a given day.
 *
 * The shop's own bookings table is the source of truth here, not the Google
 * Calendar — the calendar is a mirror written after staff confirm, so it lags
 * by design and would miss every request still waiting for a decision. Holding
 * a slot the moment it is requested is the whole point.
 *
 * Two ways a slot goes away:
 *
 *   - the whole shop is full, meaning as many overlapping bookings as there are
 *     barbers to take them; or
 *   - a specific barber was asked for and that barber is already busy.
 *
 * Pending requests count. A slot someone asked for twenty minutes ago is not
 * free just because nobody has pressed confirm yet, and letting a second
 * customer book it would only create work for the shop.
 */

type Interval = { start: number; end: number; barber: string };

async function bookedIntervals(date: string): Promise<Interval[]> {
  const [rows, services] = await Promise.all([
    getDb()
      .selectFrom("bookings")
      .select(["requested_time", "service_slug", "barber_slug"])
      .where("requested_date", "=", date)
      .where("status", "in", ["pending", "confirmed"])
      .execute(),
    listServices(),
  ]);

  const minutesFor = new Map(services.map((s) => [s.slug, s.minutes]));

  return rows.map((row) => {
    const start = timeToMinutes(row.requested_time);
    // An unknown slug should still hold a sensible block rather than nothing.
    const length = minutesFor.get(row.service_slug) ?? 60;
    return { start, end: start + length, barber: row.barber_slug };
  });
}

export type Availability = {
  /** Times that can no longer be booked, as `HH:MM`. */
  busy: string[];
  /** How many barbers can work in parallel — the capacity a slot is judged against. */
  capacity: number;
};

export async function availabilityFor(date: string, barberSlug: string): Promise<Availability> {
  const [intervals, barbers] = await Promise.all([bookedIntervals(date), listBarbers()]);

  // "any" is a booking option, not a person, so it never adds capacity.
  const capacity = Math.max(1, barbers.filter((b) => b.slug !== "any").length);

  const today = shopToday();
  const nowMinutes = shopNowMinutes();

  const busy = slotTimes().filter((time) => {
    const start = timeToMinutes(time);

    // On today's date, a time that has already passed is not bookable.
    if (date === today && start <= nowMinutes) return true;

    const overlapping = intervals.filter((i) => start >= i.start && start < i.end);
    if (overlapping.length >= capacity) return true;

    if (barberSlug !== "any" && overlapping.some((i) => i.barber === barberSlug)) return true;

    return false;
  });

  return { busy, capacity };
}
