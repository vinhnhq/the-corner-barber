/**
 * One-time move of every picture and clip into Vercel Blob.
 *
 * Three sources, one output — `src/db/media.seed.json`, which `db:seed` reads:
 *
 * 1. `public/photos/*.jpg` — the curated set already sized for the web, with
 *    the alt text and blur placeholders from the old static manifest. These
 *    keep their ids, so the slots and barber avatars still point at them.
 * 2. `public/video/hero-loop.*` — the hero background loop and its poster.
 * 3. `temp/*` — whatever the shop just handed over. HEIC goes through `sips`
 *    (ImageMagick here has no HEIC coder), everything is auto-oriented,
 *    stripped of metadata and capped at MAX_EDGE; clips are transcoded to
 *    1080p H.264/AAC with the moov atom up front. These land hidden so they
 *    can be curated from the phone.
 *
 * Idempotent: a blob that already exists is overwritten in place, and the
 * seed only ever inserts rows that are missing — anything the shop has since
 * renamed, hidden or reordered is left alone.
 *
 * Requires ImageMagick 7, ffmpeg and macOS `sips`. Run: bun run assets:import
 */
import { put } from "@vercel/blob";
import { $ } from "bun";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import curatedSources from "./curated-sources.json";
import { photos } from "./legacy-photos";

const TEMP_DIR = "temp";
const WORK_DIR = "scratch/media-import";
const SEED_FILE = "src/db/media.seed.json";

const MAX_EDGE = 2400;
const QUALITY = 82;
const LQIP_WIDTH = 16;
const VIDEO_MAX_EDGE = 1920;

type SeedMedia = {
  id: string;
  kind: "image" | "video";
  url: string;
  poster_url: string | null;
  width: number;
  height: number;
  blur: string;
  alt: string;
  bytes: number;
  is_visible: 0 | 1;
};

type Seed = {
  media: SeedMedia[];
  /** Section → media id. */
  slots: Record<string, string>;
};

/** The static pages' picture assignments, carried over as the defaults. */
const SLOTS: Record<string, string> = {
  hero: "hero-loop",
  "package-1": "craft-cut-window",
  "package-2": "craft-style",
  "package-3": "craft-nails",
  "about-1": "detail-est-sign",
  "about-2": "detail-carving",
  booking: "hero-stations",
};

/** The gallery selection the static site shipped with — the rest start hidden. */
function shippedInGallery(id: string): boolean {
  const slot = photos[id as keyof typeof photos]?.slot;
  if (slot === "interior" || slot === "detail") return true;
  if (slot === "craft") {
    const craft = Object.entries(photos)
      .filter(([, p]) => p.slot === "craft")
      .map(([k]) => k);
    return craft.indexOf(id) < 6;
  }
  return false;
}

function slug(file: string): string {
  return basename(file, extname(file))
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

async function bytesOf(path: string): Promise<number> {
  return (await stat(path)).size;
}

async function dimensions(path: string): Promise<[number, number]> {
  const out = await $`magick identify -format "%w %h" ${path}[0]`.quiet().text();
  const [w, h] = out.trim().split(" ").map(Number);
  return [w, h];
}

async function lqip(path: string): Promise<string> {
  const geometry = `${LQIP_WIDTH}x`;
  const buf = await $`magick ${path} -auto-orient -resize ${geometry} -quality 40 jpg:-`
    .quiet()
    .arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`;
}

async function upload(pathname: string, file: string, contentType: string): Promise<string> {
  const body = await readFile(file);
  const blob = await put(pathname, body, {
    // Explicit: the SDK prefers a Vercel OIDC token when it can find one, and
    // the one `vercel env pull` writes is not enabled for development.
    token: process.env.BLOB_READ_WRITE_TOKEN,
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  return blob.url;
}

/** Any still → one web JPEG at `WORK_DIR/<id>.jpg`. */
async function encodeImage(source: string, id: string): Promise<string> {
  let input = source;
  if (/\.heic$/i.test(source)) {
    // ImageMagick on this machine has no HEIC coder; macOS does.
    input = join(WORK_DIR, `${id}.heic.jpg`);
    await $`sips -s format jpeg -s formatOptions 95 ${source} --out ${input}`.quiet();
  }
  const out = join(WORK_DIR, `${id}.jpg`);
  const geometry = `${MAX_EDGE}x${MAX_EDGE}>`;
  await $`magick ${input} -auto-orient -strip -resize ${geometry} -quality ${QUALITY} -interlace Plane ${out}`.quiet();
  return out;
}

/** Any clip → 1080p H.264/AAC MP4 plus a poster frame. */
async function encodeVideo(source: string, id: string): Promise<{ mp4: string; poster: string }> {
  const mp4 = join(WORK_DIR, `${id}.mp4`);
  const poster = join(WORK_DIR, `${id}-poster.jpg`);
  // Longer edge capped at 1080p, even dimensions (libx264 needs them), ffmpeg
  // applies the rotation metadata itself.
  const scale = `scale='if(gt(iw,ih),min(${VIDEO_MAX_EDGE},iw),-2)':'if(gt(iw,ih),-2,min(${VIDEO_MAX_EDGE},ih))'`;
  await $`ffmpeg -y -loglevel error -i ${source} -vf ${scale} -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart ${mp4}`.quiet();
  await $`ffmpeg -y -loglevel error -ss 1 -i ${mp4} -frames:v 1 -q:v 3 ${poster}`.quiet();
  return { mp4, poster };
}

async function importStatic(): Promise<SeedMedia[]> {
  const rows: SeedMedia[] = [];
  for (const [id, photo] of Object.entries(photos)) {
    const file = join("public", photo.src);
    const url = await upload(`media/${id}.jpg`, file, "image/jpeg");
    rows.push({
      id,
      kind: "image",
      url,
      poster_url: null,
      width: photo.width,
      height: photo.height,
      blur: photo.blur,
      alt: photo.alt,
      bytes: await bytesOf(file),
      is_visible: shippedInGallery(id) ? 1 : 0,
    });
    console.info(`  ↑ ${id}`);
  }

  const mp4 = "public/video/hero-loop.mp4";
  const poster = "public/video/hero-loop-poster.jpg";
  const [width, height] = await dimensions(poster);
  rows.push({
    id: "hero-loop",
    kind: "video",
    url: await upload("media/hero-loop.mp4", mp4, "video/mp4"),
    poster_url: await upload("media/hero-loop-poster.jpg", poster, "image/jpeg"),
    width,
    height,
    blur: await lqip(poster),
    alt: "Không gian tiệm — đoạn phim ngắn",
    bytes: await bytesOf(mp4),
    is_visible: 0,
  });
  console.info("  ↑ hero-loop");
  return rows;
}

/**
 * Every still and clip in one folder, optimised and pushed. `skip` holds
 * source paths already in Blob under a curated id (the old manifest), so the
 * same frame is not uploaded twice under a second name.
 */
async function importDir(
  dir: string,
  prefix: string,
  skip: Set<string> = new Set(),
): Promise<SeedMedia[]> {
  const rows: SeedMedia[] = [];
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => !f.startsWith(".")).sort();
  } catch {
    console.info(`  (no ${dir}/ directory — skipped)`);
    return rows;
  }

  for (const name of files) {
    const source = join(dir, name);
    if (skip.has(source)) {
      console.info(`  = ${name} (already curated)`);
      continue;
    }
    const id = `${prefix}-${slug(name)}`;
    const ext = extname(name).toLowerCase();

    if ([".mov", ".mp4", ".m4v"].includes(ext)) {
      console.info(`  ⟳ ${name} (transcoding…)`);
      const { mp4, poster } = await encodeVideo(source, id);
      const [width, height] = await dimensions(poster);
      rows.push({
        id,
        kind: "video",
        url: await upload(`media/${id}.mp4`, mp4, "video/mp4"),
        poster_url: await upload(`media/${id}-poster.jpg`, poster, "image/jpeg"),
        width,
        height,
        blur: await lqip(poster),
        alt: "",
        bytes: await bytesOf(mp4),
        is_visible: 0,
      });
    } else if ([".jpg", ".jpeg", ".png", ".heic", ".webp"].includes(ext)) {
      const jpg = await encodeImage(source, id);
      const [width, height] = await dimensions(jpg);
      rows.push({
        id,
        kind: "image",
        url: await upload(`media/${id}.jpg`, jpg, "image/jpeg"),
        poster_url: null,
        width,
        height,
        blur: await lqip(jpg),
        alt: "",
        bytes: await bytesOf(jpg),
        is_visible: 0,
      });
    } else {
      console.info(`  – ${name} (skipped)`);
      continue;
    }
    console.info(`  ↑ ${id}`);
  }
  return rows;
}

/** Merges new rows into the seed file by id, so a later run adds rather than replaces. */
async function mergeSeed(rows: SeedMedia[], slots: Record<string, string> = {}) {
  let seed: Seed = { media: [], slots: {} };
  try {
    seed = JSON.parse(await readFile(SEED_FILE, "utf8")) as Seed;
  } catch {
    // First run — start empty.
  }
  const byId = new Map(seed.media.map((m) => [m.id, m]));
  for (const row of rows) byId.set(row.id, row);
  seed = { media: [...byId.values()], slots: { ...seed.slots, ...slots } };
  await writeFile(SEED_FILE, `${JSON.stringify(seed, null, 2)}\n`);
  return seed;
}

/**
 * `bun run assets:import`             — the static set + `temp/` (first run).
 * `bun run assets:import <dir> [<dir>…]` — those folders, e.g. the originals
 *   in `_source-assets/`, skipping any file the curated set already covers.
 */
async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not set — put it in .env.local");
    process.exit(1);
  }

  await rm(WORK_DIR, { recursive: true, force: true });
  await mkdir(WORK_DIR, { recursive: true });

  const dirs = process.argv.slice(2);
  let rows: SeedMedia[];
  let slots: Record<string, string> = {};

  if (dirs.length > 0) {
    const curated = new Set<string>(curatedSources);
    rows = [];
    for (const dir of dirs) {
      // Folder names are Vietnamese, which `slug` would reduce to consonants;
      // name the batch by what it is instead.
      const folder = basename(dir.replace(/\/$/, ""));
      const prefix = folder.includes("khai trương")
        ? folder.endsWith("2")
          ? "opening2"
          : "opening"
        : "shop";
      console.info(`Imported from ${dir}:`);
      rows.push(...(await importDir(dir, prefix, curated)));
    }
  } else {
    console.info("Static set:");
    rows = await importStatic();
    console.info(`Imported from ${TEMP_DIR}/:`);
    rows.push(...(await importDir(TEMP_DIR, "t")));
    slots = SLOTS;
  }

  const seed = await mergeSeed(rows, slots);

  const total = seed.media.reduce((sum, m) => sum + m.bytes, 0);
  console.info(
    `\n${seed.media.length} items, ${(total / 1_000_000).toFixed(1)} MB in Blob → ${SEED_FILE}`,
  );
  console.info("Now: bun run db:seed");
}

await main();
