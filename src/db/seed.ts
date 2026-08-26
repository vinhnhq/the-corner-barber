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
import { db, now } from "./client";
import { photosInSlot } from "../lib/photos";
import { barbers, services, shop } from "../lib/shop";

async function seedServices() {
  for (const service of services) {
    await db
      .insertInto("services")
      .values({
        slug: service.slug,
        group_name: service.group,
        rank: service.rank,
        name_vi: service.nameVi,
        name_en: service.nameEn,
        price: service.price,
        was_price: service.wasPrice,
        minutes: service.minutes,
        includes_vi: JSON.stringify(service.includesVi),
        includes_en: JSON.stringify(service.includesEn),
        is_active: 1,
      })
      .onConflict((oc) =>
        oc.column("slug").doUpdateSet({
          group_name: service.group,
          rank: service.rank,
          name_vi: service.nameVi,
          name_en: service.nameEn,
          price: service.price,
          was_price: service.wasPrice,
          minutes: service.minutes,
          includes_vi: JSON.stringify(service.includesVi),
          includes_en: JSON.stringify(service.includesEn),
        }),
      )
      .execute();
  }
  console.info(`  services: ${services.length}`);
}

async function seedBarbers() {
  for (const [index, barber] of barbers.entries()) {
    await db
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
    await db
      .insertInto("shop_settings")
      .values({ key, value, updated_at: now() })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value, updated_at: now() }))
      .execute();
  }
  console.info(`  settings: ${Object.keys(settings).length}`);
}

async function seedGallery() {
  const selection = [
    ...photosInSlot("interior"),
    ...photosInSlot("detail"),
    ...photosInSlot("craft").slice(0, 6),
  ];

  for (const [index, photo] of selection.entries()) {
    await db
      .insertInto("gallery_photos")
      .values({ photo_id: photo.id, rank: index, is_visible: 1 })
      .onConflict((oc) => oc.column("photo_id").doUpdateSet({ rank: index }))
      .execute();
  }
  console.info(`  gallery: ${selection.length}`);
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
  await seedGallery();
  await db.destroy();
}

await main();
