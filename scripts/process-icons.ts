/**
 * Builds the site icons from the supplied barber-pole mark.
 *
 * The source export is a black silhouette on transparency, which cannot be used
 * as-is: black on a transparent ground disappears against a dark browser tab
 * strip, and iOS flattens `apple-touch-icon` onto black, so the home-screen
 * icon would be black on black. Every output here is therefore an opaque tile —
 * the site's olive ground with the mark recoloured to brass — which stays
 * legible on light and dark chrome alike.
 *
 * Three shapes, because the platforms mask differently:
 *
 *   icon / favicon  rounded corners, drawn by us — browsers show it verbatim
 *   apple           full square, no rounding — iOS applies its own squircle
 *   maskable        full square, mark inside the centre 80% — Android may crop
 *                   to a circle, and anything outside that safe zone is lost
 *
 * Run: bun run assets:icons
 */
import { $ } from "bun";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = "favicon/android-chrome-512x512.png";

/** Resolved from the oklch tokens in globals.css. */
const BRASS = "#DFB45E";
const GROUND = "#0D100A";

const APP_DIR = "src/app";
const PUBLIC_DIR = "public/icons";
const WORK = "scratch/icons";

/**
 * Recolours the black silhouette to brass.
 *
 * `-colorize 100` replaces the colour channels outright and leaves alpha alone,
 * which is what keeps the cut-out shape. Reaching for a clone-and-CopyOpacity
 * dance instead flattens the mask and yields a solid brass square.
 */
async function brassMark(out: string) {
  // `-trim` drops the transparent margin either side of the pole (the source is
  // a 220px-wide mark on a 512px square canvas). It does not change the height,
  // which is already full-bleed — it just guarantees the composite is centred on
  // the mark itself rather than on whatever canvas it was exported into.
  await $`magick ${SOURCE} -fill ${BRASS} -colorize 100 -trim +repage ${out}`.quiet();
}

/**
 * Composites the mark onto an opaque tile.
 *
 * `inset` is the share of the tile left as margin — the mark is scaled to fill
 * what remains. `radius` of 0 leaves a hard square for the platforms that mask
 * it themselves.
 */
async function tile(mark: string, out: string, size: number, inset: number, radius: number) {
  // The pole is tall and narrow, so it is scaled to the tile's *height*. Fitting
  // it to a square box instead would leave it floating in a sea of margin.
  const markHeight = Math.round(size * (1 - inset * 2));
  const scaled = join(WORK, `mark-${size}-${Math.round(inset * 100)}.png`);
  const geometry = `x${markHeight}`;
  await $`magick ${mark} -resize ${geometry} ${scaled}`.quiet();

  if (radius === 0) {
    await $`magick -size ${size}x${size} xc:${GROUND} ${scaled} -gravity center -composite ${out}`.quiet();
    return;
  }

  const edge = size - 1;
  const ground = join(WORK, `ground-${size}.png`);
  await $`magick -size ${size}x${size} xc:none -fill ${GROUND} -draw ${`roundrectangle 0,0,${edge},${edge},${radius},${radius}`} ${ground}`.quiet();
  await $`magick ${ground} ${scaled} -gravity center -composite ${out}`.quiet();
}

async function main() {
  await rm(WORK, { recursive: true, force: true });
  await mkdir(WORK, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  const mark = join(WORK, "mark-brass.png");
  await brassMark(mark);

  // Browser tab. Next serves src/app/icon.png as <link rel="icon">.
  await tile(mark, join(APP_DIR, "icon.png"), 512, 0.12, 110);

  // iOS home screen: opaque, square, generous margin for the system squircle.
  await tile(mark, join(APP_DIR, "apple-icon.png"), 180, 0.16, 0);

  // Manifest icons. The maskable pair keeps the mark well inside the safe zone.
  await tile(mark, join(PUBLIC_DIR, "icon-192.png"), 192, 0.12, 42);
  await tile(mark, join(PUBLIC_DIR, "icon-512.png"), 512, 0.12, 110);
  await tile(mark, join(PUBLIC_DIR, "maskable-512.png"), 512, 0.2, 0);

  // The bare mark, brass on transparency, for placing inline beside the
  // wordmark in the header and footer — there it sits on the page's own ground
  // and must not bring a tile of its own.
  await $`magick ${mark} -resize x256 ${join(PUBLIC_DIR, "mark.png")}`.quiet();

  // favicon.ico carries 16/32/48 so the browser picks what it needs. The
  // smallest sizes get a touch less margin — at 16px the mark is only a few
  // pixels wide and needs every one of them.
  const icoParts: string[] = [];
  for (const [size, inset, radius] of [
    [16, 0.06, 3],
    [32, 0.09, 6],
    [48, 0.1, 10],
  ] as const) {
    const part = join(WORK, `ico-${size}.png`);
    await tile(mark, part, size, inset, radius);
    icoParts.push(part);
  }
  await $`magick ${icoParts} ${join(APP_DIR, "favicon.ico")}`.quiet();

  console.info(`  ${APP_DIR}/favicon.ico       16 + 32 + 48`);
  console.info(`  ${APP_DIR}/icon.png          512`);
  console.info(`  ${APP_DIR}/apple-icon.png    180`);
  console.info(`  ${PUBLIC_DIR}/icon-192.png`);
  console.info(`  ${PUBLIC_DIR}/icon-512.png`);
  console.info(`  ${PUBLIC_DIR}/maskable-512.png`);
  console.info(`  ${PUBLIC_DIR}/mark.png          inline logo`);
}

await main();
