/**
 * Builds labelled contact sheets over every source photo so the whole shoot can
 * be reviewed at a glance before anything is picked for the site.
 *
 * Output: scratch/sheets/<set>-<n>.jpg   (gitignored)
 *
 * Requires ImageMagick 7 (`magick`, `montage`).
 */
import { $ } from "bun";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";

const SOURCE_ROOT = "_source-assets";
const OUT_DIR = "scratch/sheets";

/** Short, ASCII-safe key per source folder — the originals have Vietnamese names. */
const SETS: Record<string, string> = {
  "Ảnh của tiệm a Felix": "shop",
  "Ảnh khai trương tiệm a Felix": "opening",
};

const PER_SHEET = 30;
const TILE = "6x5";
const THUMB_WIDTH = 340;
/** ImageMagick has no font config on this machine; point it at a system face. */
const LABEL_FONT = "/System/Library/Fonts/Supplemental/Andale Mono.ttf";

async function jpgsIn(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  return entries
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort()
    .map((f) => join(dir, f));
}

async function buildSheet(files: string[], out: string) {
  // ImageMagick applies settings only to images read *after* them, so `-label`,
  // `-font` and `-auto-orient` all have to precede the file list. `%t` prints
  // the source basename under each tile so picks map back to the originals, and
  // `-auto-orient` honours the EXIF rotation the camera wrote.
  await $`montage -font ${LABEL_FONT} -pointsize 15 -label %t -auto-orient ${files} -thumbnail ${THUMB_WIDTH}x${THUMB_WIDTH} -background "#141712" -fill "#e8e4d8" -tile ${TILE} -geometry +6+6 -quality 82 ${out}`.quiet();
}

async function main() {
  if (!existsSync(SOURCE_ROOT)) throw new Error(`missing ${SOURCE_ROOT}`);
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  for (const [folder, key] of Object.entries(SETS)) {
    const dir = join(SOURCE_ROOT, folder);
    if (!existsSync(dir)) {
      console.warn(`skip: ${dir} not found`);
      continue;
    }
    const files = await jpgsIn(dir);
    console.info(`${key}: ${files.length} photos`);

    for (let i = 0; i < files.length; i += PER_SHEET) {
      const chunk = files.slice(i, i + PER_SHEET);
      const n = String(i / PER_SHEET + 1).padStart(2, "0");
      const out = join(OUT_DIR, `${key}-${n}.jpg`);
      await buildSheet(chunk, out);
      console.info(`  ${basename(out)}  (${chunk[0]} … ${chunk.at(-1)})`);
    }
  }
}

await main();
