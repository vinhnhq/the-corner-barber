"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Camera, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { registerMedia } from "@/app/actions/media";
import { isVideo, prepare } from "@/lib/media-client";
import { cn } from "@/lib/utils";

type Stage = "preparing" | "uploading" | "saving" | "done" | "error";

type Item = {
  key: string;
  name: string;
  video: boolean;
  stage: Stage;
  /** 0–1 within the current stage. */
  progress: number;
  /** Bytes before → after preparation, once known. */
  saved?: [number, number];
  message?: string;
};

const STAGE_LABEL: Record<Stage, string> = {
  preparing: "Đang tối ưu",
  uploading: "Đang tải lên",
  saving: "Đang lưu",
  done: "Xong",
  error: "Lỗi",
};

function mb(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/**
 * Pick pictures or clips from the phone, shape them on the device, send them
 * straight to Blob, then record each one. Files run one after another: a
 * phone re-encoding two clips at once runs out of memory before it runs out
 * of patience.
 */
export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  function patch(key: string, changes: Partial<Item>) {
    setItems((list) => list.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }

  async function handle(file: File, key: string) {
    const prepared = await prepare(file, (fraction) => patch(key, { progress: fraction }));
    patch(key, {
      stage: "uploading",
      progress: 0,
      saved: [file.size, prepared.blob.size],
    });

    const stem = `media/${Date.now().toString(36)}`;
    const ext = prepared.kind === "video" ? "mp4" : "jpg";
    const blob = await upload(`${stem}.${ext}`, prepared.blob, {
      access: "public",
      handleUploadUrl: "/admin/api/upload",
      contentType: prepared.contentType,
      multipart: prepared.blob.size > 20 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => patch(key, { progress: percentage / 100 }),
    });

    let posterUrl: string | null = null;
    if (prepared.kind === "video") {
      const poster = await upload(`${stem}-poster.jpg`, prepared.poster, {
        access: "public",
        handleUploadUrl: "/admin/api/upload",
        contentType: "image/jpeg",
      });
      posterUrl = poster.url;
    }

    patch(key, { stage: "saving", progress: 1 });
    await registerMedia({
      kind: prepared.kind,
      url: blob.url,
      posterUrl,
      width: prepared.width,
      height: prepared.height,
      blur: prepared.blur,
      bytes: prepared.blob.size,
      alt: "",
    });
    patch(key, { stage: "done" });
  }

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const queued = files.map<[File, Item]>((file) => [
      file,
      {
        key: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        video: isVideo(file),
        stage: "preparing",
        progress: 0,
      },
    ]);
    setItems((list) => [...queued.map(([, item]) => item), ...list]);
    setBusy(true);

    let ok = 0;
    for (const [file, item] of queued) {
      try {
        await handle(file, item.key);
        ok += 1;
        router.refresh();
      } catch (error) {
        patch(item.key, {
          stage: "error",
          message: error instanceof Error ? error.message : "không rõ lỗi",
        });
      }
    }
    setBusy(false);
    if (ok > 0) toast.success(ok === 1 ? "Đã thêm 1 mục" : `Đã thêm ${ok} mục`);
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        onChange={onChange}
        disabled={busy}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="surface flex min-h-14 w-full items-center justify-center gap-3 px-6 text-base text-cream transition-colors hover:bg-muted disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin text-brass" aria-hidden />
        ) : (
          <Camera className="size-5 text-brass" aria-hidden />
        )}
        {busy ? "Đang xử lý…" : "Thêm ảnh hoặc phim"}
      </button>
      <p className="text-sm text-muted-foreground">
        Ảnh được thu về tối đa 2400px, phim về 1080p ngay trên điện thoại trước khi tải lên — chờ
        một chút với phim dài.
      </p>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.key} className="surface flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm text-cream">{item.name}</span>
                <span
                  className={cn(
                    "tag shrink-0",
                    item.stage === "error"
                      ? "text-destructive"
                      : item.stage === "done"
                        ? "text-brass"
                        : "text-muted-foreground",
                  )}
                >
                  {STAGE_LABEL[item.stage]}
                </span>
                {item.stage === "done" && <Check className="size-4 text-brass" aria-hidden />}
                {item.stage === "error" && <X className="size-4 text-destructive" aria-hidden />}
              </div>

              {(item.stage === "preparing" || item.stage === "uploading") && (
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brass transition-[width] duration-300"
                    style={{
                      width: `${Math.round(
                        // Preparing an image has no progress events; show it as busy.
                        item.stage === "preparing" && !item.video ? 100 : item.progress * 100,
                      )}%`,
                    }}
                  />
                </div>
              )}

              {item.saved && item.stage !== "error" && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {mb(item.saved[0])} → {mb(item.saved[1])}
                </p>
              )}
              {item.message && <p className="text-xs text-destructive">{item.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
