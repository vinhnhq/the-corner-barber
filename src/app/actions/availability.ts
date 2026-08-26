"use server";

import { z } from "zod";
import { availabilityFor } from "@/lib/availability";

const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  barber: z.string().trim().min(1).max(64),
});

/**
 * Which times are already taken on a day, for the booking form to grey out.
 *
 * Read-only and unauthenticated, which is fine: it returns nothing but a list
 * of times. No customer name, phone or service ever leaves through here, so
 * knowing the shop is busy at 3pm tells an outsider only what walking past the
 * window would.
 */
export async function getBusySlots(date: string, barber: string): Promise<string[]> {
  const parsed = inputSchema.safeParse({ date, barber });
  if (!parsed.success) return [];

  try {
    const { busy } = await availabilityFor(parsed.data.date, parsed.data.barber);
    return busy;
  } catch (error) {
    // Failing open is deliberate: a lookup problem should not stop someone
    // asking for an appointment. Staff still see and vet every request.
    console.error("[availability] lookup failed", error);
    return [];
  }
}
