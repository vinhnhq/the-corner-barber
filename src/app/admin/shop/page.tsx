import { updateBarber, updateHours } from "@/app/actions/admin";
import { AdminSection, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDb } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { shop } from "@/lib/shop";

const DAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

type Hour = { day: number; open: string; close: string };

/** The shop itself: who works here and when the door is open. */
export default async function AdminShopPage() {
  assertAdminEnabled();

  const [barbers, hoursRow] = await Promise.all([
    getDb().selectFrom("barbers").selectAll().orderBy("rank").execute(),
    getDb()
      .selectFrom("shop_settings")
      .select("value")
      .where("key", "=", "hours")
      .executeTakeFirst(),
  ]);

  const stored: Hour[] = hoursRow ? (JSON.parse(hoursRow.value) as Hour[]) : [...shop.hours];
  const byDay = new Map(stored.map((h) => [h.day, h]));

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Tiệm"
        lede={`${shop.address.street}, ${shop.address.ward} — ${shop.phoneDisplay}`}
      />

      <AdminSection
        title="Thợ"
        lede="Tên hiện khi khách đặt lịch. “Thợ bất kỳ” là lựa chọn mặc định, không phải một người. Ảnh thợ chọn ở mục Trang chính."
      >
        <ul className="flex flex-col gap-3">
          {barbers.map((barber) => (
            <li key={barber.slug}>
              <form
                action={updateBarber}
                className="surface grid items-end gap-3 p-4 sm:grid-cols-[1.4fr_1.4fr_auto]"
              >
                <input type="hidden" name="slug" value={barber.slug} />
                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">Tên (VI)</span>
                  <Input name="nameVi" defaultValue={barber.name_vi} required />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">Tên (EN)</span>
                  <Input name="nameEn" defaultValue={barber.name_en} required />
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground sm:min-h-9">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={barber.is_active === 1}
                      className="size-4 accent-[var(--brass)]"
                    />
                    Nhận lịch
                  </label>
                  <Button type="submit" variant="secondary" size="sm">
                    Lưu
                  </Button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      </AdminSection>

      <AdminSection
        title="Giờ mở cửa"
        lede="Hiện ở chân trang. Giờ hiện tại là giờ tạm — xác nhận lại với tiệm."
      >
        <form action={updateHours} className="surface flex flex-col gap-3 p-4 sm:p-6">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const entry = byDay.get(day) ?? { day, open: "08:30", close: "20:30" };
            return (
              <div
                key={day}
                className="grid items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:grid-cols-[10rem_1fr_1fr]"
              >
                <span className="font-serif text-lg text-cream">{DAYS[day]}</span>
                <label className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                  <span className="tag text-dim">Mở</span>
                  <Input type="time" name={`open-${day}`} defaultValue={entry.open} required />
                </label>
                <label className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                  <span className="tag text-dim">Đóng</span>
                  <Input type="time" name={`close-${day}`} defaultValue={entry.close} required />
                </label>
              </div>
            );
          })}
          <Button type="submit" className="mt-3 self-start">
            Lưu giờ mở cửa
          </Button>
        </form>
      </AdminSection>
    </div>
  );
}
