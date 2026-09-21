"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { MEDIA_SLOTS, type MediaSlot } from "@/lib/media";

const ADMIN_MEDIA = "/admin/media";

/** `FormData#get` can hand back a `File`; every field here is text, so anything else is discarded. */
function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function refresh() {
  revalidatePath(ADMIN_MEDIA);
  revalidatePath("/admin/pages");
  revalidatePath("/admin/shop");
  revalidatePath("/");
}

const registerSchema = z.object({
  kind: z.enum(["image", "video"]),
  url: z.string().url(),
  posterUrl: z.string().url().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blur: z.string().startsWith("data:image/"),
  bytes: z.number().int().nonnegative(),
  alt: z.string().trim().max(200).default(""),
});

export type RegisterMediaInput = z.input<typeof registerSchema>;

/**
 * Records a file the browser has already put in Blob. New items go to the
 * front of the gallery, visible: the person uploading from the shop floor
 * expects to see the picture on the site straight away.
 */
export async function registerMedia(input: RegisterMediaInput): Promise<{ id: string }> {
  assertAdminEnabled();
  const data = registerSchema.parse(input);

  const id = `m-${crypto.randomUUID().slice(0, 8)}`;
  const db = getDb();
  const first = await db
    .selectFrom("media")
    .select((eb) => eb.fn.min("rank").as("min"))
    .executeTakeFirst();

  await db
    .insertInto("media")
    .values({
      id,
      kind: data.kind,
      url: data.url,
      poster_url: data.posterUrl,
      width: data.width,
      height: data.height,
      blur: data.blur,
      alt: data.alt,
      bytes: data.bytes,
      rank: (first?.min ?? 1) - 1,
      is_visible: 1,
    })
    .execute();

  refresh();
  return { id };
}

export async function updateMediaAlt(formData: FormData): Promise<void> {
  assertAdminEnabled();
  const id = field(formData, "id");
  const alt = field(formData, "alt").trim().slice(0, 200);
  if (!id) return;

  await getDb().updateTable("media").set({ alt }).where("id", "=", id).execute();
  refresh();
}

export async function setMediaVisible(formData: FormData): Promise<void> {
  assertAdminEnabled();
  const id = field(formData, "id");
  const visible = formData.get("visible") === "true" ? 1 : 0;
  if (!id) return;

  await getDb().updateTable("media").set({ is_visible: visible }).where("id", "=", id).execute();
  refresh();
}

/**
 * Swaps rank with the neighbour above or below among the items the gallery
 * shows. Hidden items are left out of the swap — otherwise a move could trade
 * places with something invisible and look like nothing happened.
 */
export async function moveMedia(formData: FormData): Promise<void> {
  assertAdminEnabled();
  const id = field(formData, "id");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  if (!id) return;

  const db = getDb();
  const rows = await db
    .selectFrom("media")
    .select(["id"])
    .where("is_visible", "=", 1)
    .orderBy("rank")
    .orderBy("created_at", "desc")
    .execute();

  const index = rows.findIndex((r) => r.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= rows.length) return;

  // Re-number the shown list so ranks are dense and the swap is unambiguous —
  // seeded rows all start at 0, where a plain swap would be a no-op.
  const order = rows.map((r) => r.id);
  [order[index], order[target]] = [order[target], order[index]];
  for (const [rank, rowId] of order.entries()) {
    await db.updateTable("media").set({ rank }).where("id", "=", rowId).execute();
  }
  refresh();
}

/**
 * Removes the row, the slot assignments and the avatar references, then the
 * files in Blob. The database goes first: if Blob deletion fails the site
 * has already stopped pointing at the file, which is the safe direction.
 */
export async function deleteMedia(formData: FormData): Promise<void> {
  assertAdminEnabled();
  const id = field(formData, "id");
  if (!id) return;

  const db = getDb();
  const row = await db.selectFrom("media").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return;

  await db.deleteFrom("media_slots").where("media_id", "=", id).execute();
  await db.updateTable("barbers").set({ photo_id: null }).where("photo_id", "=", id).execute();
  await db.deleteFrom("media").where("id", "=", id).execute();

  const urls = [row.url, row.poster_url].filter((u): u is string => u !== null);
  try {
    await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error("blob delete failed", { id, error });
  }
  refresh();
}

export async function assignSlot(formData: FormData): Promise<void> {
  assertAdminEnabled();
  const slot = field(formData, "slot");
  const mediaId = field(formData, "mediaId");
  if (!(MEDIA_SLOTS as readonly string[]).includes(slot)) return;

  const db = getDb();
  if (mediaId === "") {
    await db
      .deleteFrom("media_slots")
      .where("slot", "=", slot as MediaSlot)
      .execute();
  } else {
    await db
      .insertInto("media_slots")
      .values({ slot, media_id: mediaId })
      .onConflict((oc) => oc.column("slot").doUpdateSet({ media_id: mediaId }))
      .execute();
  }
  refresh();
}

export async function setBarberPhoto(formData: FormData): Promise<void> {
  assertAdminEnabled();
  const slug = field(formData, "slug");
  const mediaId = field(formData, "mediaId");
  if (!slug || slug === "any") return;

  await getDb()
    .updateTable("barbers")
    .set({ photo_id: mediaId === "" ? null : mediaId })
    .where("slug", "=", slug)
    .execute();
  refresh();
}
