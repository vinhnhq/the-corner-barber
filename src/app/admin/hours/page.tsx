import { updateHours } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { shop } from "@/lib/shop";

const DAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

type Hour = { day: number; open: string; close: string };

export default async function AdminHoursPage() {
  assertAdminEnabled();

  const row = await db
    .selectFrom("shop_settings")
    .select("value")
    .where("key", "=", "hours")
    .executeTakeFirst();

  const stored: Hour[] = row ? (JSON.parse(row.value) as Hour[]) : [...shop.hours];
  const byDay = new Map(stored.map((h) => [h.day, h]));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-cream">Giờ mở cửa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Giờ hiện tại vẫn là giờ tạm — cần xác nhận lại với tiệm.
        </p>
      </div>

      <form action={updateHours} className="panel flex flex-col gap-3 p-6">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const entry = byDay.get(day) ?? { day, open: "08:30", close: "20:30" };
          return (
            <div
              key={day}
              className="grid items-center gap-3 border-b border-border/50 pb-3 last:border-0 sm:grid-cols-[10rem_1fr_1fr]"
            >
              <span className="text-sm text-cream">{DAYS[day]}</span>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Mở
                <Input type="time" name={`open-${day}`} defaultValue={entry.open} required />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Đóng
                <Input type="time" name={`close-${day}`} defaultValue={entry.close} required />
              </label>
            </div>
          );
        })}

        <Button type="submit" className="mt-3 self-start">
          Lưu giờ mở cửa
        </Button>
      </form>
    </div>
  );
}
