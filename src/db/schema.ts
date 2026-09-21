import type { Generated } from "kysely";

/**
 * SQLite has no boolean or date type, so booleans are stored as 0/1 integers
 * and every timestamp is an ISO-8601 string in UTC. The column types below say
 * so explicitly rather than pretending otherwise.
 */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "done";

export type ServicesTable = {
  id: Generated<number>;
  slug: string;
  group_name: "package" | "relax" | "colour" | "perm";
  rank: number;
  name_vi: string;
  name_en: string;
  /** Đồng. */
  price: number;
  /** High end of a price range, else null. */
  price_max: number | null;
  was_price: number | null;
  minutes: number;
  /** JSON array of strings. */
  includes_vi: string;
  includes_en: string;
  tagline_vi: string | null;
  tagline_en: string | null;
  is_active: Generated<number>;
};

export type BarbersTable = {
  id: Generated<number>;
  slug: string;
  name_vi: string;
  name_en: string;
  /** `media.id` of the avatar, or null (always null for "any barber"). */
  photo_id: string | null;
  rank: Generated<number>;
  is_active: Generated<number>;
};

export type BookingsTable = {
  id: Generated<number>;
  customer_name: string;
  /** Digits only, as normalised by `normalisePhone`. */
  customer_phone: string;
  service_slug: string;
  barber_slug: string;
  /** `YYYY-MM-DD`, in the shop's local time. */
  requested_date: string;
  /** `HH:MM`, in the shop's local time. */
  requested_time: string;
  note: string | null;
  status: Generated<BookingStatus>;
  /** Free-text note the shop adds when confirming or rescheduling. */
  staff_note: string | null;
  /** Event id on the shop's Google Calendar, once confirmed. */
  google_event_id: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
};

export type ShopSettingsTable = {
  key: string;
  value: string;
  updated_at: Generated<string>;
};

export type MediaKind = "image" | "video";

/**
 * Every picture and clip the site can show, stored in Vercel Blob. Rows are
 * created by the admin upload flow (or the one-time import) after the file is
 * already in Blob, so `url` is always a real, public address.
 */
export type MediaTable = {
  id: string;
  kind: MediaKind;
  url: string;
  /** Still frame for a video, else null. */
  poster_url: string | null;
  width: number;
  height: number;
  /** Base64 LQIP data URI for `placeholder="blur"`. */
  blur: string;
  alt: Generated<string>;
  bytes: number;
  /** Gallery order. */
  rank: Generated<number>;
  /** Shown in the gallery. Slots and avatars ignore this. */
  is_visible: Generated<number>;
  created_at: Generated<string>;
};

/** Which media fills a fixed place on the page — hero, package cards, about, booking. */
export type MediaSlotsTable = {
  slot: string;
  media_id: string;
};

export type Database = {
  services: ServicesTable;
  barbers: BarbersTable;
  bookings: BookingsTable;
  shop_settings: ShopSettingsTable;
  media: MediaTable;
  media_slots: MediaSlotsTable;
};
