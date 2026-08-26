import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { About } from "@/components/sections/about";
import { Barbers } from "@/components/sections/barbers";
import { Booking } from "@/components/sections/booking";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Visit } from "@/components/sections/visit";
import { listBarbers, listGalleryPhotoIds, listServices } from "@/lib/bookings";
import { getTranslations } from "@/lib/i18n/server";
import { barbers as fallbackBarbers } from "@/lib/shop";

export default async function HomePage() {
  const [{ locale, t }, services, barberRows, galleryIds] = await Promise.all([
    getTranslations(),
    listServices(),
    listBarbers().catch(() => []),
    listGalleryPhotoIds(),
  ]);

  const barbers =
    barberRows.length > 0
      ? barberRows.map((b) => ({ slug: b.slug, nameVi: b.name_vi, nameEn: b.name_en }))
      : fallbackBarbers.map((b) => ({ slug: b.slug, nameVi: b.nameVi, nameEn: b.nameEn }));

  return (
    <>
      <SiteHeader locale={locale} t={t} />
      <main className="flex-1">
        <Hero t={t} />
        <Services t={t} locale={locale} services={services} />
        <Gallery t={t} photoIds={galleryIds} />
        <Barbers t={t} locale={locale} />
        <About t={t} />
        <Visit t={t} />
        <Booking t={t} locale={locale} services={services} barbers={barbers} />
      </main>
      <SiteFooter t={t} locale={locale} />
    </>
  );
}
