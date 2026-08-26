import Image from "next/image";
import { updateBarber } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { photos, type PhotoId } from "@/lib/photos";

export default async function AdminBarbersPage() {
  assertAdminEnabled();

  const barbers = await db.selectFrom("barbers").selectAll().orderBy("rank").execute();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-cream">Thợ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đổi tên thợ. &ldquo;Thợ bất kỳ&rdquo; là lựa chọn mặc định khi đặt lịch, không phải một
          người.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {barbers.map((barber) => {
          const photo = barber.photo_id ? photos[barber.photo_id as PhotoId] : null;

          return (
            <form
              key={barber.slug}
              action={updateBarber}
              className="panel grid items-end gap-4 p-5 sm:grid-cols-[auto_1.4fr_1.4fr_auto]"
            >
              <input type="hidden" name="slug" value={barber.slug} />

              <div className="relative size-14 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
                {photo && (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>

              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Tên (VI)
                <Input name="nameVi" defaultValue={barber.name_vi} required />
              </label>

              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Tên (EN)
                <Input name="nameEn" defaultValue={barber.name_en} required />
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={barber.is_active === 1}
                    className="size-4 accent-[var(--brass)]"
                  />
                  Hiện
                </label>
                <Button type="submit" size="sm">
                  Lưu
                </Button>
              </div>
            </form>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Ảnh thợ lấy từ <code className="font-mono">scripts/photos.manifest.ts</code>. Thêm ảnh mới
        rồi chạy <code className="font-mono">bun run assets:photos</code>.
      </p>
    </div>
  );
}
