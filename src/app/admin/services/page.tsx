import { updateService } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { formatVnd } from "@/lib/shop";

const GROUP_LABEL: Record<string, string> = {
  package: "Gói dịch vụ",
  single: "Dịch vụ lẻ",
  colour: "Uốn & nhuộm",
};

export default async function AdminServicesPage() {
  assertAdminEnabled();

  const services = await db
    .selectFrom("services")
    .selectAll()
    .orderBy("group_name")
    .orderBy("rank")
    .execute();

  const groups = ["package", "single", "colour"] as const;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-cream">Dịch vụ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sửa tên, giá và thời lượng. Thay đổi hiện ngay trên trang chính.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group} className="flex flex-col gap-3">
          <h2 className="label text-[0.68rem] text-brass">{GROUP_LABEL[group]}</h2>

          {services
            .filter((s) => s.group_name === group)
            .map((service) => (
              <form
                key={service.slug}
                action={updateService}
                className="panel grid items-end gap-4 p-5 sm:grid-cols-[1.4fr_1.4fr_1fr_0.7fr_auto]"
              >
                <input type="hidden" name="slug" value={service.slug} />

                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Tên (VI)
                  <Input name="nameVi" defaultValue={service.name_vi} required />
                </label>

                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Tên (EN)
                  <Input name="nameEn" defaultValue={service.name_en} required />
                </label>

                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Giá ({formatVnd(service.price)})
                  <Input
                    name="price"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={service.price}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Phút
                  <Input
                    name="minutes"
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    defaultValue={service.minutes}
                    required
                  />
                </label>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={service.is_active === 1}
                      className="size-4 accent-[var(--brass)]"
                    />
                    Hiện
                  </label>
                  <Button type="submit" size="sm">
                    Lưu
                  </Button>
                </div>
              </form>
            ))}
        </section>
      ))}
    </div>
  );
}
