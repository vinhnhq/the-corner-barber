import { updateService } from "@/app/actions/admin";
import { AdminSection, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDb } from "@/db/client";
import { assertAdminEnabled } from "@/lib/admin";
import { formatPrice, SERVICE_GROUPS, type ServiceGroup } from "@/lib/shop";

const GROUP_LABEL: Record<ServiceGroup, string> = {
  package: "Gói dịch vụ",
  relax: "Thư giãn",
  colour: "Nhuộm & tẩy tóc",
  perm: "Uốn tóc",
};

export default async function AdminServicesPage() {
  assertAdminEnabled();

  const services = await getDb()
    .selectFrom("services")
    .selectAll()
    .orderBy("group_name")
    .orderBy("rank")
    .execute();

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Dịch vụ"
        lede="Sửa tên, giá và thời lượng. Để trống “Giá tối đa” nếu giá cố định. Thay đổi hiện ngay trên trang chính."
      />

      {SERVICE_GROUPS.map((group) => (
        <AdminSection key={group} title={GROUP_LABEL[group]}>
          {services
            .filter((s) => s.group_name === group)
            .map((service) => (
              <form
                key={service.slug}
                action={updateService}
                className="surface grid items-end gap-3 p-4 sm:grid-cols-[1.4fr_1.4fr_1fr_1fr_0.7fr_auto]"
              >
                <input type="hidden" name="slug" value={service.slug} />

                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">Tên (VI)</span>
                  <Input name="nameVi" defaultValue={service.name_vi} required />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">Tên (EN)</span>
                  <Input name="nameEn" defaultValue={service.name_en} required />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">
                    Giá ({formatPrice({ price: service.price, priceMax: service.price_max })})
                  </span>
                  <Input
                    name="price"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={service.price}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">Giá tối đa</span>
                  <Input
                    name="priceMax"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={service.price_max ?? ""}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="tag text-dim">Phút</span>
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

                <div className="flex items-center gap-4">
                  <label className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground sm:min-h-9">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={service.is_active === 1}
                      className="size-4 accent-[var(--brass)]"
                    />
                    Hiện
                  </label>
                  <Button type="submit" variant="secondary" size="sm">
                    Lưu
                  </Button>
                </div>
              </form>
            ))}
        </AdminSection>
      ))}
    </div>
  );
}
