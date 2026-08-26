/**
 * Schema migrations.
 *
 * Small enough to keep as an ordered list in one file: each entry runs once and
 * its name is recorded in `_migrations`. Re-running is a no-op.
 *
 * Run: bun run db:migrate
 */
import { sql } from "kysely";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { db } from "./client";

type Migration = { name: string; up: () => Promise<void> };

const migrations: Migration[] = [
  {
    name: "0001_initial",
    up: async () => {
      await sql`
        CREATE TABLE services (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          slug        TEXT    NOT NULL UNIQUE,
          group_name  TEXT    NOT NULL CHECK (group_name IN ('package','single','colour')),
          rank        INTEGER NOT NULL,
          name_vi     TEXT    NOT NULL,
          name_en     TEXT    NOT NULL,
          price       INTEGER NOT NULL,
          was_price   INTEGER,
          minutes     INTEGER NOT NULL,
          includes_vi TEXT    NOT NULL DEFAULT '[]',
          includes_en TEXT    NOT NULL DEFAULT '[]',
          is_active   INTEGER NOT NULL DEFAULT 1
        )
      `.execute(db);

      await sql`
        CREATE TABLE barbers (
          id        INTEGER PRIMARY KEY AUTOINCREMENT,
          slug      TEXT    NOT NULL UNIQUE,
          name_vi   TEXT    NOT NULL,
          name_en   TEXT    NOT NULL,
          photo_id  TEXT,
          rank      INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1
        )
      `.execute(db);

      await sql`
        CREATE TABLE bookings (
          id             INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name  TEXT    NOT NULL,
          customer_phone TEXT    NOT NULL,
          service_slug   TEXT    NOT NULL,
          barber_slug    TEXT    NOT NULL DEFAULT 'any',
          requested_date TEXT    NOT NULL,
          requested_time TEXT    NOT NULL,
          note           TEXT,
          status         TEXT    NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','confirmed','cancelled','done')),
          staff_note     TEXT,
          created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
          updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
        )
      `.execute(db);

      // The admin list is always "newest first, optionally filtered by status",
      // and the rate limiter looks up recent rows for one phone number.
      await sql`CREATE INDEX bookings_status_created ON bookings (status, created_at DESC)`.execute(
        db,
      );
      await sql`CREATE INDEX bookings_phone_created ON bookings (customer_phone, created_at DESC)`.execute(
        db,
      );
      await sql`CREATE INDEX bookings_date ON bookings (requested_date)`.execute(db);

      await sql`
        CREATE TABLE shop_settings (
          key        TEXT PRIMARY KEY,
          value      TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `.execute(db);

      await sql`
        CREATE TABLE gallery_photos (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          photo_id   TEXT    NOT NULL UNIQUE,
          rank       INTEGER NOT NULL DEFAULT 0,
          is_visible INTEGER NOT NULL DEFAULT 1
        )
      `.execute(db);
    },
  },
  {
    name: "0002_google_calendar_event",
    up: async () => {
      // Set once the booking is confirmed and an event exists on the shop's
      // calendar. Null means "no event" — either not confirmed yet, or the
      // calendar integration is not configured.
      await sql`ALTER TABLE bookings ADD COLUMN google_event_id TEXT`.execute(db);
    },
  },
];

async function ensureLocalDirectory() {
  const url = process.env.DATABASE_URL ?? "file:./data/corner.db";
  if (!url.startsWith("file:")) return;
  await mkdir(dirname(url.slice("file:".length)), { recursive: true });
}

async function main() {
  await ensureLocalDirectory();

  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name    TEXT PRIMARY KEY,
      ran_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `.execute(db);

  const done = await sql<{ name: string }>`SELECT name FROM _migrations`.execute(db);
  const applied = new Set(done.rows.map((r) => r.name));

  for (const migration of migrations) {
    if (applied.has(migration.name)) {
      console.info(`  = ${migration.name}`);
      continue;
    }
    await migration.up();
    await sql`INSERT INTO _migrations (name) VALUES (${migration.name})`.execute(db);
    console.info(`  + ${migration.name}`);
  }

  await db.destroy();
}

await main();
