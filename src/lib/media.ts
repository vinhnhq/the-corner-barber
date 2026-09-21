import { getDb } from "@/db/client";
import type { MediaKind } from "@/db/schema";

/**
 * The fixed places on the page that take one picture (or, for the hero, a
 * clip). Everything else the site shows is the gallery — `media.is_visible`
 * in `rank` order — or a barber's avatar via `barbers.photo_id`.
 */
export const MEDIA_SLOTS = [
  "hero",
  "package-1",
  "package-2",
  "package-3",
  "about-1",
  "about-2",
  "booking",
] as const;

export type MediaSlot = (typeof MEDIA_SLOTS)[number];

export const SLOT_LABEL: Record<MediaSlot, string> = {
  hero: "Ảnh / phim nền đầu trang",
  "package-1": "Gói 1",
  "package-2": "Gói 2",
  "package-3": "Gói 3",
  "about-1": "Về The Corner — ảnh lớn",
  "about-2": "Về The Corner — ảnh nhỏ",
  booking: "Nền phần đặt lịch",
};

export type Media = {
  id: string;
  kind: MediaKind;
  url: string;
  posterUrl: string | null;
  width: number;
  height: number;
  blur: string;
  alt: string;
  bytes: number;
  rank: number;
  visible: boolean;
  createdAt: string;
};

type Row = {
  id: string;
  kind: MediaKind;
  url: string;
  poster_url: string | null;
  width: number;
  height: number;
  blur: string;
  alt: string;
  bytes: number;
  rank: number;
  is_visible: number;
  created_at: string;
};

function fromRow(row: Row): Media {
  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    posterUrl: row.poster_url,
    width: row.width,
    height: row.height,
    blur: row.blur,
    alt: row.alt,
    bytes: row.bytes,
    rank: row.rank,
    visible: row.is_visible === 1,
    createdAt: row.created_at,
  };
}

/** Everything, newest first — the admin's view. */
export async function listAllMedia(): Promise<Media[]> {
  const rows = await getDb()
    .selectFrom("media")
    .selectAll()
    .orderBy("rank")
    .orderBy("created_at", "desc")
    .execute();
  return rows.map(fromRow);
}

/** The gallery: visible items in rank order. Empty when the database is unreachable. */
export async function listGalleryMedia(): Promise<Media[]> {
  try {
    const rows = await getDb()
      .selectFrom("media")
      .selectAll()
      .where("is_visible", "=", 1)
      .orderBy("rank")
      .orderBy("created_at", "desc")
      .execute();
    return rows.map(fromRow);
  } catch {
    return [];
  }
}

export type SlotMedia = Partial<Record<MediaSlot, Media>>;

/** Slot → media, for the sections that take a fixed picture. Missing slots render without one. */
export async function getSlotMedia(): Promise<SlotMedia> {
  try {
    const rows = await getDb()
      .selectFrom("media_slots")
      .innerJoin("media", "media.id", "media_slots.media_id")
      .select([
        "media_slots.slot",
        "media.id",
        "media.kind",
        "media.url",
        "media.poster_url",
        "media.width",
        "media.height",
        "media.blur",
        "media.alt",
        "media.bytes",
        "media.rank",
        "media.is_visible",
        "media.created_at",
      ])
      .execute();

    const out: SlotMedia = {};
    for (const row of rows) {
      if ((MEDIA_SLOTS as readonly string[]).includes(row.slot)) {
        out[row.slot as MediaSlot] = fromRow(row);
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Sizes hint for a picture that fills a card in a 3-column grid. */
export const CARD_SIZES = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw";

/** The image to show for any media — the poster for a clip. */
export function stillOf(media: Media): string {
  return media.kind === "video" ? (media.posterUrl ?? media.url) : media.url;
}
