import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, EyeOff, Film } from "lucide-react";
import { assignSlot, moveMedia, setBarberPhoto, setMediaVisible } from "@/app/actions/media";
import { MediaPicker, type PickerItem } from "@/components/admin/media-picker";
import { AdminSection, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import {
  getSlotMedia,
  listAllMedia,
  MEDIA_SLOTS,
  SLOT_LABEL,
  stillOf,
  type Media,
} from "@/lib/media";

/** Where on the page each place sits, so the list reads top to bottom like the site. */
const PLACE_HINT: Record<(typeof MEDIA_SLOTS)[number], string> = {
  hero: "Toàn màn hình đầu trang. Phim sẽ tự chạy trên máy tính, ảnh tĩnh trên điện thoại.",
  "package-1": "Ảnh trên thẻ gói Cắt & xả tóc.",
  "package-2": "Ảnh trên thẻ The Corner Experience.",
  "package-3": "Ảnh trên thẻ Chăm sóc toàn diện.",
  "about-1": "Ảnh ngang lớn, mục Về The Corner.",
  "about-2": "Ảnh ngang nhỏ bên dưới.",
  booking: "Ảnh mờ phía sau mẫu đặt lịch.",
};

function toPicker(m: Media): PickerItem {
  return { id: m.id, still: stillOf(m), blur: m.blur, alt: m.alt, kind: m.kind };
}

function Thumb({ media, className }: { media: Media | undefined; className: string }) {
  if (!media) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-border bg-background text-dim ${className}`}
      >
        <span className="tag text-[0.55rem]">Trống</span>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden border border-border bg-card ${className}`}>
      <Image
        src={stillOf(media)}
        alt={media.alt}
        fill
        sizes="160px"
        placeholder="blur"
        blurDataURL={media.blur}
        className="object-cover"
      />
      {media.kind === "video" && (
        <span className="absolute top-1.5 left-1.5 rounded-full bg-background/80 p-1">
          <Film className="size-3 text-cream" aria-hidden />
        </span>
      )}
    </div>
  );
}

export default async function AdminPagesPage() {
  assertAdminEnabled();

  const [all, slots, barbers] = await Promise.all([
    listAllMedia(),
    getSlotMedia(),
    getDb().selectFrom("barbers").selectAll().where("slug", "<>", "any").orderBy("rank").execute(),
  ]);

  const byId = new Map(all.map((m) => [m.id, m]));
  const images = all.filter((m) => m.kind === "image").map(toPicker);
  const everything = all.map(toPicker);
  const gallery = all.filter((m) => m.visible);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Trang chính"
        lede="Mỗi chỗ trên trang lấy một ảnh từ Thư viện. Chọn ảnh ở đây; tải ảnh mới ở mục Thư viện."
      >
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/media">Mở Thư viện</Link>
        </Button>
      </PageHeader>

      <AdminSection title="Các vị trí" lede="Theo thứ tự từ trên xuống dưới của trang.">
        <ul className="flex flex-col gap-3">
          {MEDIA_SLOTS.map((slot) => {
            const current = slots[slot];
            return (
              <li key={slot} className="surface flex items-center gap-4 p-3 sm:p-4">
                <Thumb media={current} className="size-20 shrink-0 sm:size-24" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="font-serif text-lg text-cream">{SLOT_LABEL[slot]}</p>
                  <p className="text-xs text-muted-foreground">{PLACE_HINT[slot]}</p>
                  {current?.alt && (
                    <p className="truncate text-xs text-dim">Đang dùng: {current.alt}</p>
                  )}
                </div>
                <MediaPicker
                  mode="single"
                  title={SLOT_LABEL[slot]}
                  items={slot === "hero" ? everything : images}
                  value={current?.id ?? null}
                  name="mediaId"
                  fields={{ slot }}
                  action={assignSlot}
                  clearLabel="Bỏ trống"
                  className="shrink-0"
                />
              </li>
            );
          })}
        </ul>
      </AdminSection>

      <AdminSection
        title="Ảnh thợ"
        lede="Hiện trong mục Tiệm và bên cạnh tên thợ khi khách đặt lịch."
      >
        <ul className="flex flex-col gap-3">
          {barbers.map((barber) => {
            const current = barber.photo_id ? byId.get(barber.photo_id) : undefined;
            return (
              <li key={barber.slug} className="surface flex items-center gap-4 p-3 sm:p-4">
                <Thumb media={current} className="size-16 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="font-serif text-lg text-cream">{barber.name_vi}</p>
                  <p className="text-xs text-muted-foreground">
                    {barber.is_active === 1 ? "Đang nhận lịch" : "Đang tắt"}
                  </p>
                </div>
                <MediaPicker
                  mode="single"
                  title={barber.name_vi}
                  items={images}
                  value={barber.photo_id}
                  name="mediaId"
                  fields={{ slug: barber.slug }}
                  action={setBarberPhoto}
                  clearLabel="Bỏ ảnh"
                  className="shrink-0"
                />
              </li>
            );
          })}
        </ul>
      </AdminSection>

      <AdminSection
        title="Không gian"
        lede={`${gallery.length} mục đang hiện, theo thứ tự này. Ảnh đầu tiên là ô lớn.`}
        aside={
          <MediaPicker
            mode="multi"
            title="Không gian"
            items={everything}
            selected={gallery.map((m) => m.id)}
            action={setMediaVisible}
          />
        }
      >
        {gallery.length === 0 ? (
          <p className="surface px-6 py-12 text-center text-sm text-muted-foreground">
            Chưa chọn ảnh nào. Bấm &ldquo;Thêm / bớt ảnh&rdquo; để chọn từ Thư viện.
          </p>
        ) : (
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((media, index) => (
              <li key={media.id} className="surface flex flex-col gap-2 p-2">
                <Thumb media={media} className="aspect-square w-full" />
                <div className="flex items-center gap-1">
                  <span className="tag pl-1 text-dim tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <form action={moveMedia} className="ml-auto flex gap-1">
                    <input type="hidden" name="id" value={media.id} />
                    <Button
                      type="submit"
                      name="direction"
                      value="up"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === 0}
                      aria-label="Lên"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="submit"
                      name="direction"
                      value="down"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === gallery.length - 1}
                      aria-label="Xuống"
                    >
                      <ArrowDown />
                    </Button>
                  </form>
                  <form action={setMediaVisible}>
                    <input type="hidden" name="id" value={media.id} />
                    <input type="hidden" name="visible" value="false" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ẩn khỏi Không gian"
                    >
                      <EyeOff />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        )}
      </AdminSection>
    </div>
  );
}
