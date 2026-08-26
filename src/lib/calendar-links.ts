import {
  endsAt,
  SHOP_TIME_ZONE,
  startsAt,
  toLocalIso,
  toUtcBasic,
  type Appointment,
} from "@/lib/appointment-time";
import { shop } from "@/lib/shop";

/**
 * Client-side "add this to your own calendar" helpers.
 *
 * There is no way to write to a customer's calendar — that would need them to
 * sign in and grant access, which nobody does to book a haircut. So the
 * customer half of the feature is a link they tap: a prefilled Google Calendar
 * template for Android and desktop, and an `.ics` for iPhone and Outlook.
 *
 * Both are generated from data the browser already has, so there is no endpoint
 * exposing a booking by id and nothing extra to authorise.
 */

export type CustomerAppointment = Appointment & {
  serviceName: string;
};

function title(appointment: CustomerAppointment): string {
  return `${appointment.serviceName} — ${shop.name} ${shop.suffix}`;
}

function location(): string {
  return `${shop.address.street}, ${shop.address.ward}, ${shop.address.city}`;
}

function details(): string {
  return `${shop.name} ${shop.suffix}\n${shop.phoneDisplay}`;
}

/**
 * Google's event-template URL. Both endpoints are sent as local wall time with
 * an explicit `ctz`, so the customer sees 09:00 whatever zone their device is
 * set to — rather than the time translated into their own.
 */
export function googleCalendarUrl(appointment: CustomerAppointment): string {
  const start = toLocalIso(appointment).replace(/[-:]/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(appointment),
    dates: `${start}/${localBasicEnd(appointment)}`,
    details: details(),
    location: location(),
    ctz: SHOP_TIME_ZONE,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** End time in the same local basic form Google expects alongside `ctz`. */
function localBasicEnd(appointment: CustomerAppointment): string {
  const end = endsAt(appointment);
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

  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}00`;
}

/** ASCII-safe key for the UID: Vietnamese is stripped to its base letters. */
function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Escapes the characters iCalendar treats as syntax. */
function escapeIcs(value: string): string {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/**
 * A minimal VEVENT. Times are written in UTC (`…Z`), which every client
 * understands without needing an embedded VTIMEZONE block.
 */
export function icsFile(appointment: CustomerAppointment): string {
  const start = startsAt(appointment);
  const end = endsAt(appointment);

  // Re-downloading the same appointment should replace the entry rather than
  // duplicate it, so the UID is derived from the appointment itself. The
  // service is part of it so two different bookings in one slot stay distinct.
  const uid = `${appointment.date}-${appointment.time.replace(":", "")}-${slug(appointment.serviceName)}@thecorner.local`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Corner Barbershop//Booking//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    // DTSTAMP is when this iCalendar object was produced, not when the
    // appointment starts — those are different fields and different instants.
    `DTSTAMP:${toUtcBasic(new Date())}`,
    `DTSTART:${toUtcBasic(start)}`,
    `DTEND:${toUtcBasic(end)}`,
    `SUMMARY:${escapeIcs(title(appointment))}`,
    `DESCRIPTION:${escapeIcs(details())}`,
    `LOCATION:${escapeIcs(location())}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title(appointment))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    // iCalendar lines are CRLF-terminated, and the file must end with one.
  ]
    .join("\r\n")
    .concat("\r\n");
}

export function icsFileName(appointment: CustomerAppointment): string {
  return `the-corner-${appointment.date}-${appointment.time.replace(":", "")}.ics`;
}
