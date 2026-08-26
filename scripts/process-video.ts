/**
 * Cuts the hero background loop out of the opening-day footage.
 *
 * The source is 4K H.264. `avconvert` (macOS, ships with the OS) handles the
 * trim + downscale; there is no ffmpeg on this machine, so there is no WebM or
 * AV1 variant — H.264 MP4 plays everywhere that matters, and the poster frame
 * covers anyone who blocks autoplay.
 *
 * Run: bun run assets:video
 */
import { $ } from "bun";
import { mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = "_source-assets/Ảnh khai trương tiệm a Felix/P7250705.MOV";
const OUT_DIR = "public/video";
const NAME = "hero-loop";

/** Trim window, in seconds. The clip is 5.5s; skip the unsteady first moment. */
const START = 0.4;
const DURATION = 4.8;

/** 720p is plenty for a background loop that is dimmed and overlaid with type. */
const PRESET = "Preset1280x720";

async function mb(path: string): Promise<string> {
  const { size } = await stat(path);
  return `${(size / 1_000_000).toFixed(2)} MB`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const mp4 = join(OUT_DIR, `${NAME}.mp4`);
  await $`avconvert --source ${SOURCE} --output ${mp4} --preset ${PRESET} --start ${START} --duration ${DURATION} --replace`.quiet();
  console.info(`  ${mp4}  ${await mb(mp4)}`);

  // Poster: first frame of the trimmed clip, used as the <video> poster and as
  // the still fallback on small screens where the loop is not downloaded.
  const probe = join(OUT_DIR, `${NAME}-probe.mov`);
  await $`avconvert --source ${mp4} --output ${probe} --preset Preset1280x720 --start 0 --duration 0.4 --replace`.quiet();
  await $`qlmanage -t -s 1600 -o ${OUT_DIR} ${probe}`.quiet();

  const poster = join(OUT_DIR, `${NAME}-poster.jpg`);
  await $`magick ${probe}.png -resize 1600x -quality 80 -strip ${poster}`.quiet();
  await rm(probe, { force: true });
  await rm(`${probe}.png`, { force: true });
  console.info(`  ${poster}  ${await mb(poster)}`);
}

await main();
