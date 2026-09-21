import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyBar } from "@/components/sticky-bar";
import { About } from "@/components/sections/about";
import { Booking } from "@/components/sections/booking";
import { ClosingCta } from "@/components/sections/closing-cta";
import { Experience } from "@/components/sections/experience";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Space } from "@/components/sections/space";
import { listBarbers, listServices } from "@/lib/bookings";
import { getTranslations } from "@/lib/i18n/server";
import { getSlotMedia, listGalleryMedia } from "@/lib/media";
import { barbers as fallbackBarbers } from "@/lib/shop";

export default async function HomePage() {
  const [{ locale, t }, services, barberRows, gallery, slots] = await Promise.all([
    getTranslations(),
    listServices(),
    listBarbers().catch(() => []),
    listGalleryMedia(),
    getSlotMedia(),
  ]);

  const barbers =
    barberRows.length > 0
      ? barberRows.map((b) => ({ slug: b.slug, nameVi: b.name_vi, nameEn: b.name_en }))
      : fallbackBarbers.map((b) => ({ slug: b.slug, nameVi: b.nameVi, nameEn: b.nameEn }));

  return (
    <>
      <SiteHeader locale={locale} t={t} />
      <main className="flex-1">
        <Hero t={t} backdrop={slots.hero} />
        <About t={t} pictures={[slots["about-1"], slots["about-2"]]} />
        <Services
          t={t}
          locale={locale}
          services={services}
          pictures={[slots["package-1"], slots["package-2"], slots["package-3"]]}
        />
        <Space t={t} media={gallery} />
        <Experience t={t} />
        <Booking
          t={t}
          locale={locale}
          services={services}
          barbers={barbers}
          backdrop={slots.booking}
        />
        <Faq t={t} />
        <ClosingCta t={t} />
      </main>
      <SiteFooter t={t} locale={locale} />
      <StickyBar t={t} />
    </>
  );
}
