/**
 * Seeds the shop's real menu, the barber list and the gallery selection.
 *
 * The source of truth is `src/lib/shop.ts`, transcribed from the shop's own
 * price board — so editing that file and re-seeding is how content changes
 * until the admin screens are in use.
 *
 * Idempotent: every insert is an upsert on the natural key.
 *
 * Run: bun run db:seed
 */
import { getDb, now } from "./client";
import { barbers, services, shop } from "../lib/shop";
import mediaSeed from "./media.seed.json";

async function seedServices() {
  for (const service of services) {
    await getDb()
      .insertInto("services")
      .values({
        slug: service.slug,
        group_name: service.group,
        rank: service.rank,
        name_vi: service.nameVi,
        name_en: service.nameEn,
        price: service.price,
        price_max: service.priceMax,
        was_price: service.wasPrice,
        minutes: service.minutes,
        includes_vi: JSON.stringify(service.includesVi),
        includes_en: JSON.stringify(service.includesEn),
        tagline_vi: service.taglineVi,
        tagline_en: service.taglineEn,
        is_active: 1,
      })
      .onConflict((oc) =>
        oc.column("slug").doUpdateSet({
          group_name: service.group,
          rank: service.rank,
          name_vi: service.nameVi,
          name_en: service.nameEn,
          price: service.price,
          price_max: service.priceMax,
          was_price: service.wasPrice,
          minutes: service.minutes,
          includes_vi: JSON.stringify(service.includesVi),
          includes_en: JSON.stringify(service.includesEn),
          tagline_vi: service.taglineVi,
          tagline_en: service.taglineEn,
          is_active: 1,
        }),
      )
      .execute();
  }

  // Anything the shop took off the menu is hidden, not deleted: old bookings
  // still name it by slug and the admin list can show what it was.
  const retired = await getDb()
    .updateTable("services")
    .set({ is_active: 0 })
    .where(
      "slug",
      "not in",
      services.map((s) => s.slug),
    )
    .returning("slug")
    .execute();

  console.info(`  services: ${services.length} (${retired.length} retired)`);
}

async function seedBarbers() {
  for (const [index, barber] of barbers.entries()) {
    await getDb()
      .insertInto("barbers")
      .values({
        slug: barber.slug,
        name_vi: barber.nameVi,
        name_en: barber.nameEn,
        photo_id: barber.photoId,
        rank: index,
        is_active: 1,
      })
      .onConflict((oc) =>
        oc.column("slug").doUpdateSet({
          name_vi: barber.nameVi,
          name_en: barber.nameEn,
          photo_id: barber.photoId,
          rank: index,
        }),
      )
      .execute();
  }
  console.info(`  barbers: ${barbers.length}`);
}

async function seedSettings() {
  const settings: Record<string, string> = {
    hours: JSON.stringify(shop.hours),
    phone: shop.phone,
    address: JSON.stringify(shop.address),
    social: JSON.stringify(shop.social),
  };

  for (const [key, value] of Object.entries(settings)) {
    await getDb()
      .insertInto("shop_settings")
      .values({ key, value, updated_at: now() })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value, updated_at: now() }))
      .execute();
  }
  console.info(`  settings: ${Object.keys(settings).length}`);
}

/**
 * Pictures and clips already in Vercel Blob, as `scripts/import-media.ts`
 * left them. Insert-only: the shop curates alt text, order and visibility from
 * the phone, and a re-seed must not undo that. Slots are filled only when the
 * slot is empty, for the same reason.
 */
async function seedMedia() {
  let inserted = 0;
  for (const m of mediaSeed.media) {
    const result = await getDb()
      .insertInto("media")
      .values({
        id: m.id,
        kind: m.kind as "image" | "video",
        url: m.url,
        poster_url: m.poster_url,
        width: m.width,
        height: m.height,
        blur: m.blur,
        alt: m.alt,
        bytes: m.bytes,
        rank: "rank" in m ? m.rank : 0,
        is_visible: m.is_visible,
      })
      .onConflict((oc) => oc.column("id").doNothing())
      .executeTakeFirst();
    inserted += Number(result.numInsertedOrUpdatedRows ?? 0);
  }

  for (const [slot, mediaId] of Object.entries(mediaSeed.slots)) {
    await getDb()
      .insertInto("media_slots")
      .values({ slot, media_id: mediaId })
      .onConflict((oc) => oc.column("slot").doNothing())
      .execute();
  }
  console.info(`  media: ${mediaSeed.media.length} (${inserted} new)`);
}

/**
 * Seeding upserts, so running it against a live database silently reverts the
 * service names, prices, barber names and opening hours the shop has edited in
 * /admin. Bookings are never touched — but reverting the price list on a
 * working shop is still data loss.
 *
 * A local SQLite file is disposable, so seeding it freely is the whole point.
 * Anything remote is treated as production and refused unless the caller says
 * otherwise explicitly.
 */
function assertSafeTarget() {
  const url = process.env.DATABASE_URL ?? "file:./data/corner.db";
  const isLocalFile = url.startsWith("file:");
  const forced = process.argv.includes("--force");

  if (isLocalFile || forced) return;

  console.error(
    [
      "",
      `  Refusing to seed a remote database: ${url.replace(/\/\/.*@/, "//***@")}`,
      "",
      "  Seeding overwrites service names, prices, barber names and opening",
      "  hours with the values in src/lib/shop.ts, discarding anything edited",
      "  in /admin. Bookings are not affected.",
      "",
      "  If that is genuinely what you want, re-run with --force.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

async function main() {
  assertSafeTarget();
  await seedServices();
  await seedBarbers();
  await seedSettings();
  await seedMedia();
  await getDb().destroy();
}

await main();
