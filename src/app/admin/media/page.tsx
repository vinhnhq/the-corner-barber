import Image from "next/image";
import Link from "next/link";
import { Film, Trash2 } from "lucide-react";
import { deleteMedia, updateMediaAlt } from "@/app/actions/media";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaUploader } from "@/components/admin/media-uploader";
import { AdminSection, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assertAdminEnabled } from "@/lib/admin";
import { getSlotMedia, listAllMedia, SLOT_LABEL, stillOf, type MediaSlot } from "@/lib/media";
import { cn } from "@/lib/utils";

function mb(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/**
 * The library: every file the shop has, with what it is used for. Choosing
 * where a picture goes happens on the Trang chính page — this one only adds,
 * describes and removes.
 */
export default async function AdminMediaPage() {
  assertAdminEnabled();

  const [all, slots] = await Promise.all([listAllMedia(), getSlotMedia()]);
  const usedIn = new Map<string, string[]>();
  for (const [slot, media] of Object.entries(slots)) {
    if (media)
      usedIn.set(media.id, [...(usedIn.get(media.id) ?? []), SLOT_LABEL[slot as MediaSlot]]);
  }

  const total = all.reduce((sum, m) => sum + m.bytes, 0);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Thư viện"
        lede={`${all.length} mục, ${mb(total)}. Tải lên ở đây, rồi chọn chỗ hiện ở mục Trang chính.`}
      >
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/pages">Chọn chỗ hiện</Link>
        </Button>
      </PageHeader>

      <MediaUploader />

      <AdminSection title="Tất cả" lede="Mô tả ngắn giúp người khiếm thị và Google hiểu ảnh.">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((media) => {
            const places = [
              ...(usedIn.get(media.id) ?? []),
              ...(media.visible ? ["Không gian"] : []),
            ];
            return (
              <li key={media.id} className="surface flex flex-col gap-3 p-2.5">
                <div className="relative aspect-[4/3] overflow-hidden border border-border bg-background sm:aspect-square">
                  <Image
                    src={stillOf(media)}
                    alt={media.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 92vw"
                    placeholder="blur"
                    blurDataURL={media.blur}
                    className="object-cover"
                  />
                  {media.kind === "video" && (
                    <span className="absolute top-2 left-2 rounded-full bg-background/80 p-1.5">
                      <Film className="size-3.5 text-cream" aria-label="Phim" />
                    </span>
                  )}
                </div>

                <form action={updateMediaAlt} className="flex gap-1.5">
                  <input type="hidden" name="id" value={media.id} />
                  <Input
                    name="alt"
                    defaultValue={media.alt}
                    placeholder="Mô tả ngắn"
                    maxLength={200}
                    aria-label="Mô tả"
                    className="min-w-0"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Lưu
                  </Button>
                </form>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "tag min-w-0 truncate text-[0.6rem]",
                      places.length > 0 ? "text-brass" : "text-dim",
                    )}
                    title={places.join(", ")}
                  >
                    {places.length > 0 ? places.join(" · ") : "Chưa dùng"}
                  </p>
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={media.id} />
                    <ConfirmButton
                      confirmLabel="Xoá hẳn?"
                      className="tag inline-flex min-h-9 items-center gap-1.5 px-2 text-[0.6rem] text-dim transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Xoá
                    </ConfirmButton>
                  </form>
                </div>

                <p className="flex gap-3 text-[0.7rem] text-dim tabular-nums">
                  <span>
                    {media.width}×{media.height}
                  </span>
                  <span>{mb(media.bytes)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </AdminSection>
    </div>
  );
}
