/**
 * Browser-side media preparation — runs on the phone before anything is sent.
 *
 * A picture straight off a camera is 3–15 MB and 4000+ px; a clip is tens or
 * hundreds of MB. Neither should reach Blob as-is: the site would pull the
 * full file every time the picture is shown, and next/image cannot help with
 * video at all. So the same shaping the build-time scripts used to do happens
 * here, on the device, and the upload is already the web asset.
 *
 * Images go through a canvas: EXIF orientation applied, longer edge capped,
 * re-encoded as JPEG. Videos go through WebCodecs via mediabunny — H.264/AAC
 * MP4, longer edge capped at 1080p, moov atom first — and fall back to the
 * original file where WebCodecs is missing, so the upload still works, just
 * without the saving.
 */

import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  CanvasSink,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_MEDIUM,
  canEncodeVideo,
} from "mediabunny";

const IMAGE_MAX_EDGE = 2400;
const IMAGE_QUALITY = 0.82;
const VIDEO_MAX_EDGE = 1920;
/** Width of the inline blur placeholder — a 16px JPEG is a ~300-byte string. */
const LQIP_WIDTH = 16;

export type PreparedImage = {
  kind: "image";
  blob: Blob;
  contentType: "image/jpeg";
  width: number;
  height: number;
  blur: string;
};

export type PreparedVideo = {
  kind: "video";
  blob: Blob;
  contentType: string;
  poster: Blob;
  width: number;
  height: number;
  blur: string;
  /** False when WebCodecs was unavailable and the original was kept. */
  transcoded: boolean;
};

export type Prepared = PreparedImage | PreparedVideo;

export function isVideo(file: File): boolean {
  return file.type.startsWith("video/") || /\.(mov|mp4|m4v|webm)$/i.test(file.name);
}

function fit(width: number, height: number, maxEdge: number): [number, number] {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return [Math.round(width * scale), Math.round(height * scale)];
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob returned null"))),
      type,
      quality,
    );
  });
}

function draw(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

/** The tiny blurred stand-in next/image paints while the real file loads. */
function lqip(source: CanvasImageSource, width: number, height: number): string {
  const [w, h] = [LQIP_WIDTH, Math.max(1, Math.round((height / width) * LQIP_WIDTH))];
  return draw(source, w, h).toDataURL("image/jpeg", 0.4);
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  // `from-image` bakes the EXIF rotation in, so a portrait phone shot does not
  // arrive sideways once the metadata is gone.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const [width, height] = fit(bitmap.width, bitmap.height, IMAGE_MAX_EDGE);
    const canvas = draw(bitmap, width, height);
    const blob = await toBlob(canvas, "image/jpeg", IMAGE_QUALITY);
    return {
      kind: "image",
      blob,
      contentType: "image/jpeg",
      width,
      height,
      blur: lqip(canvas, width, height),
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Grabs a frame about a second in as the poster, decoded with WebCodecs
 * rather than a `<video>` element: a detached video never reliably fires
 * `seeked` in Chrome, and this way rotation metadata is applied for free.
 */
async function posterOf(
  blob: Blob,
): Promise<{ poster: Blob; width: number; height: number; blur: string }> {
  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await track.canDecode())) throw new Error("the clip cannot be decoded here");

    const duration = await track.computeDuration();
    const sink = new CanvasSink(track, { poolSize: 1 });
    const frame = await sink.getCanvas(Math.min(1, duration / 2));
    if (!frame) throw new Error("no frame to use as a poster");

    const { width, height } = frame.canvas;
    const canvas = draw(frame.canvas, width, height);
    return {
      poster: await toBlob(canvas, "image/jpeg", IMAGE_QUALITY),
      width,
      height,
      blur: lqip(canvas, width, height),
    };
  } finally {
    input.dispose();
  }
}

/** True when this browser can re-encode to H.264 with WebCodecs. */
export async function canTranscode(): Promise<boolean> {
  if (typeof VideoEncoder === "undefined") return false;
  try {
    return await canEncodeVideo("avc");
  } catch {
    return false;
  }
}

export async function prepareVideo(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<PreparedVideo> {
  if (!(await canTranscode())) {
    const still = await posterOf(file);
    return {
      kind: "video",
      blob: file,
      contentType: file.type || "video/mp4",
      transcoded: false,
      ...still,
    };
  }

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });

  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("the file has no video track");
  const [width, height] = fit(track.displayWidth, track.displayHeight, VIDEO_MAX_EDGE);

  const conversion = await Conversion.init({
    input,
    output,
    video: { width, height, fit: "contain", codec: "avc", bitrate: QUALITY_MEDIUM },
    audio: { codec: "aac", bitrate: QUALITY_MEDIUM },
  });

  if (!conversion.isValid) {
    // Something in the source this browser cannot decode — keep the original.
    const still = await posterOf(file);
    return {
      kind: "video",
      blob: file,
      contentType: file.type || "video/mp4",
      transcoded: false,
      ...still,
    };
  }

  conversion.onProgress = (fraction) => onProgress?.(fraction);
  await conversion.execute();

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("transcode produced no output");
  const blob = new Blob([buffer], { type: "video/mp4" });
  const still = await posterOf(blob);
  return { kind: "video", blob, contentType: "video/mp4", transcoded: true, ...still };
}

export function prepare(file: File, onProgress?: (fraction: number) => void): Promise<Prepared> {
  return isVideo(file) ? prepareVideo(file, onProgress) : prepareImage(file);
}
