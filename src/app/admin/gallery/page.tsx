import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toggleGalleryPhoto } from "@/app/actions/admin";
import { db } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { photos, type PhotoId } from "@/lib/photos";
import { cn } from "@/lib/utils";

export default async function AdminGalleryPage() {
  assertAdminEnabled();

  const rows = await db.selectFrom("gallery_photos").selectAll().execute();
  const visibility = new Map(rows.map((r) => [r.photo_id, r.is_visible === 1]));

  const all = Object.entries(photos) as [PhotoId, (typeof photos)[PhotoId]][];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-cream">Thư viện ảnh</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chọn ảnh hiện trên trang chính. {rows.filter((r) => r.is_visible === 1).length} /{" "}
          {all.length} ảnh đang hiện.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {all.map(([id, photo]) => {
          const visible = visibility.get(id) ?? false;

          return (
            <li key={id} className="flex flex-col gap-2">
              <div
                className={cn(
                  "relative aspect-square overflow-hidden rounded-sm border",
                  visible ? "border-brass/50" : "border-border opacity-50",
                )}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 18vw, 45vw"
                  className="object-cover"
                />
              </div>

              <form action={toggleGalleryPhoto}>
                <input type="hidden" name="photoId" value={id} />
                <input type="hidden" name="visible" value={visible ? "false" : "true"} />
                <button
                  type="submit"
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-sm border px-2 py-1.5 text-[0.68rem] transition-colors",
                    visible
                      ? "border-brass/40 text-brass hover:bg-brass/10"
                      : "border-border text-muted-foreground hover:text-cream",
                  )}
                >
                  {visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                  {visible ? "Đang hiện" : "Đang ẩn"}
                </button>
              </form>

              <p className="truncate font-mono text-[0.6rem] text-muted-foreground" title={id}>
                {id}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
