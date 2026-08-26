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
  group_name: "package" | "single" | "colour";
  rank: number;
  name_vi: string;
  name_en: string;
  /** Đồng. */
  price: number;
  was_price: number | null;
  minutes: number;
  /** JSON array of strings. */
  includes_vi: string;
  includes_en: string;
  is_active: Generated<number>;
};

export type BarbersTable = {
  id: Generated<number>;
  slug: string;
  name_vi: string;
  name_en: string;
  /** Key into `src/lib/photos.ts`, or null for "any barber". */
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

export type GalleryPhotosTable = {
  id: Generated<number>;
  /** Key into `src/lib/photos.ts`. */
  photo_id: string;
  rank: Generated<number>;
  is_visible: Generated<number>;
};

export type Database = {
  services: ServicesTable;
  barbers: BarbersTable;
  bookings: BookingsTable;
  shop_settings: ShopSettingsTable;
  gallery_photos: GalleryPhotosTable;
};
