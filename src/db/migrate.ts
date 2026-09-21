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
import { getDb } from "./client";

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
      `.execute(getDb());

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
      `.execute(getDb());

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
      `.execute(getDb());

      // The admin list is always "newest first, optionally filtered by status",
      // and the rate limiter looks up recent rows for one phone number.
      await sql`CREATE INDEX bookings_status_created ON bookings (status, created_at DESC)`.execute(
        getDb(),
      );
      await sql`CREATE INDEX bookings_phone_created ON bookings (customer_phone, created_at DESC)`.execute(
        getDb(),
      );
      await sql`CREATE INDEX bookings_date ON bookings (requested_date)`.execute(getDb());

      await sql`
        CREATE TABLE shop_settings (
          key        TEXT PRIMARY KEY,
          value      TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `.execute(getDb());

      await sql`
        CREATE TABLE gallery_photos (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          photo_id   TEXT    NOT NULL UNIQUE,
          rank       INTEGER NOT NULL DEFAULT 0,
          is_visible INTEGER NOT NULL DEFAULT 1
        )
      `.execute(getDb());
    },
  },
  {
    name: "0002_google_calendar_event",
    up: async () => {
      // Set once the booking is confirmed and an event exists on the shop's
      // calendar. Null means "no event" — either not confirmed yet, or the
      // calendar integration is not configured.
      await sql`ALTER TABLE bookings ADD COLUMN google_event_id TEXT`.execute(getDb());
    },
  },
  {
    name: "0003_service_menu",
    up: async () => {
      // The shop rewrote its menu: "single" services became "relax", perms got
      // their own group, and several prices are now ranges. SQLite cannot
      // change a CHECK constraint in place, so the table is rebuilt and the
      // rows copied across. Bookings reference services by slug, so ids do not
      // matter.
      await sql`
        CREATE TABLE services_new (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          slug        TEXT    NOT NULL UNIQUE,
          group_name  TEXT    NOT NULL CHECK (group_name IN ('package','relax','colour','perm')),
          rank        INTEGER NOT NULL,
          name_vi     TEXT    NOT NULL,
          name_en     TEXT    NOT NULL,
          price       INTEGER NOT NULL,
          price_max   INTEGER,
          was_price   INTEGER,
          minutes     INTEGER NOT NULL,
          includes_vi TEXT    NOT NULL DEFAULT '[]',
          includes_en TEXT    NOT NULL DEFAULT '[]',
          tagline_vi  TEXT,
          tagline_en  TEXT,
          is_active   INTEGER NOT NULL DEFAULT 1
        )
      `.execute(getDb());
      await sql`
        INSERT INTO services_new
          (id, slug, group_name, rank, name_vi, name_en, price, was_price, minutes,
           includes_vi, includes_en, is_active)
        SELECT id, slug,
               CASE group_name WHEN 'single' THEN 'relax' ELSE group_name END,
               rank, name_vi, name_en, price, was_price, minutes,
               includes_vi, includes_en, is_active
        FROM services
      `.execute(getDb());
      await sql`DROP TABLE services`.execute(getDb());
      await sql`ALTER TABLE services_new RENAME TO services`.execute(getDb());
    },
  },
  {
    name: "0004_media",
    up: async () => {
      // Pictures and clips move from a static manifest in the bundle to rows
      // pointing at Vercel Blob. `gallery_photos` only ever keyed that
      // manifest, so it is dropped; the seed re-creates the same selection as
      // `media.is_visible`.
      await sql`
        CREATE TABLE media (
          id         TEXT    PRIMARY KEY,
          kind       TEXT    NOT NULL CHECK (kind IN ('image','video')),
          url        TEXT    NOT NULL,
          poster_url TEXT,
          width      INTEGER NOT NULL,
          height     INTEGER NOT NULL,
          blur       TEXT    NOT NULL,
          alt        TEXT    NOT NULL DEFAULT '',
          bytes      INTEGER NOT NULL,
          rank       INTEGER NOT NULL DEFAULT 0,
          is_visible INTEGER NOT NULL DEFAULT 0,
          created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
      `.execute(getDb());
      await sql`CREATE INDEX media_gallery ON media (is_visible, rank)`.execute(getDb());
      await sql`
        CREATE TABLE media_slots (
          slot     TEXT PRIMARY KEY,
          media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE
        )
      `.execute(getDb());
      await sql`DROP TABLE IF EXISTS gallery_photos`.execute(getDb());
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
  `.execute(getDb());

  const done = await sql<{ name: string }>`SELECT name FROM _migrations`.execute(getDb());
  const applied = new Set(done.rows.map((r) => r.name));

  for (const migration of migrations) {
    if (applied.has(migration.name)) {
      console.info(`  = ${migration.name}`);
      continue;
    }
    await migration.up();
    await sql`INSERT INTO _migrations (name) VALUES (${migration.name})`.execute(getDb());
    console.info(`  + ${migration.name}`);
  }

  await getDb().destroy();
}

await main();
