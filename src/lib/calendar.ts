import "server-only";
import { JWT } from "google-auth-library";
import { endLocalIso, SHOP_TIME_ZONE, toLocalIso, type Appointment } from "@/lib/appointment-time";
import { formatVnd, shop, type Service } from "@/lib/shop";

/**
 * Writes confirmed bookings to the shop's Google Calendar.
 *
 * Authentication is a **service account**, not OAuth. The shop shares its
 * calendar with the service account's address and grants "Make changes to
 * events"; the server then needs no user login, no consent screen, and no
 * refresh-token rotation. That last point is the deciding one: an OAuth app
 * left in "Testing" publishing status is issued refresh tokens that expire
 * after seven days, so an OAuth integration here would quietly stop working
 * every week until the app went through Google's verification review.
 *
 * Unconfigured — which is the default, and the case locally — every call logs
 * what it would have done and returns null. Nothing here can fail a booking:
 * the row is already committed before any of this runs.
 */

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
const API = "https://www.googleapis.com/calendar/v3";

export type CalendarBooking = Appointment & {
  id: number;
  name: string;
  phone: string;
  barberName: string;
  note?: string | null;
  service: Service | undefined;
  serviceSlug: string;
};

function credentials(): { email: string; key: string; calendarId: string } | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!email || !rawKey || !calendarId) return null;

  // Keys are usually pasted into .env as one line with literal "\n".
  return { email, key: rawKey.replace(/\\n/g, "\n"), calendarId };
}

async function authorize(email: string, key: string): Promise<string | null> {
  try {
    const jwt = new JWT({ email, key, scopes: SCOPES });
    const { access_token: token } = await jwt.authorize();
    return token ?? null;
  } catch (error) {
    console.error("[calendar] could not authorise service account", error);
    return null;
  }
}

function describe(booking: CalendarBooking): { summary: string; description: string } {
  const serviceName = booking.service?.nameVi ?? booking.serviceSlug;
  const price = booking.service ? ` — ${formatVnd(booking.service.price)}` : "";

  return {
    summary: `${booking.name} · ${serviceName}`,
    description: [
      `Khách: ${booking.name}`,
      `Điện thoại: ${booking.phone}`,
      `Dịch vụ: ${serviceName}${price}`,
      `Thợ: ${booking.barberName}`,
      booking.note ? `Ghi chú: ${booking.note}` : null,
      "",
      `Yêu cầu #${booking.id} — ${shop.name} ${shop.suffix}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}

function eventBody(booking: CalendarBooking) {
  const { summary, description } = describe(booking);

  return {
    summary,
    description,
    location: `${shop.address.street}, ${shop.address.ward}, ${shop.address.city}`,
    start: { dateTime: toLocalIso(booking), timeZone: SHOP_TIME_ZONE },
    end: { dateTime: endLocalIso(booking), timeZone: SHOP_TIME_ZONE },
    // The service account creates the event, so the shop's default calendar
    // reminders may not apply to it. Setting them explicitly means staff are
    // notified regardless of whose account authored the entry.
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };
}

async function request(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<Response | null> {
  const config = credentials();
  if (!config) return null;

  const token = await authorize(config.email, config.key);
  if (!token) return null;

  return fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function calendarPath(suffix = ""): string {
  const config = credentials();
  return `/calendars/${encodeURIComponent(config?.calendarId ?? "")}/events${suffix}`;
}

/** Creates the event. Returns its id, or null if unconfigured or failed. */
export async function createCalendarEvent(booking: CalendarBooking): Promise<string | null> {
  if (!credentials()) {
    console.info(
      `[calendar] not configured — would have created an event for #${booking.id} ` +
        `at ${toLocalIso(booking)} (${SHOP_TIME_ZONE})`,
    );
    return null;
  }

  try {
    const response = await request("POST", calendarPath(), eventBody(booking));
    if (!response) return null;

    if (!response.ok) {
      console.error(`[calendar] create failed: ${response.status} ${await response.text()}`);
      return null;
    }

    const created = (await response.json()) as { id?: string };
    return created.id ?? null;
  } catch (error) {
    console.error("[calendar] create request failed", error);
    return null;
  }
}

/** Moves an existing event. Returns true when the calendar was actually updated. */
export async function updateCalendarEvent(
  eventId: string,
  booking: CalendarBooking,
): Promise<boolean> {
  if (!credentials()) {
    console.info(`[calendar] not configured — would have moved event ${eventId}`);
    return false;
  }

  try {
    const response = await request(
      "PATCH",
      calendarPath(`/${encodeURIComponent(eventId)}`),
      eventBody(booking),
    );
    if (!response) return false;

    if (!response.ok) {
      console.error(`[calendar] update failed: ${response.status} ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[calendar] update request failed", error);
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  if (!credentials()) {
    console.info(`[calendar] not configured — would have deleted event ${eventId}`);
    return false;
  }

  try {
    const response = await request("DELETE", calendarPath(`/${encodeURIComponent(eventId)}`));
    if (!response) return false;

    // 410 means it is already gone, which is the state we wanted.
    if (!response.ok && response.status !== 410) {
      console.error(`[calendar] delete failed: ${response.status} ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[calendar] delete request failed", error);
    return false;
  }
}

export function calendarIsConfigured(): boolean {
  return credentials() !== null;
}
