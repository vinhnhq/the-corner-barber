import Image from "next/image";
import { BookingForm } from "@/components/booking-form";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { photos } from "@/lib/photos";
import { shopToday, type Service } from "@/lib/shop";

type BookingProps = {
  t: Dictionary;
  locale: Locale;
  services: Service[];
  barbers: { slug: string; nameVi: string; nameEn: string }[];
};

export function Booking({ t, locale, services, barbers }: BookingProps) {
  const backdrop = photos["hero-stations"];

  return (
    <section id="booking" className="relative isolate scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-20">
        <Image
          src={backdrop.src}
          alt=""
          fill
          placeholder="blur"
          blurDataURL={backdrop.blur}
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="vignette absolute inset-0 -z-10" />

      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.booking.eyebrow} title={t.booking.title} lede={t.booking.lede} />

        <Reveal delay={1} className="mt-12">
          <BookingForm
            t={t}
            locale={locale}
            services={services}
            barbers={barbers}
            today={shopToday()}
          />
        </Reveal>
      </div>
    </section>
  );
}
