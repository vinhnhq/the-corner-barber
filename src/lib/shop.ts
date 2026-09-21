/**
 * Everything the shop publishes about itself.
 *
 * The address and phone number were transcribed from the shop's street
 * signboard in the opening-day photos (`P7250619.JPG`). The menu is the one the
 * shop wrote for the site in September 2026 — see `services` below.
 *
 * Anything still unverified is marked `TODO(content)`.
 *
 * This module is the seed source for the database in `src/db/seed.ts` and the
 * static fallback the landing page renders from before any row exists.
 */

export const shop = {
  name: "The Corner",
  /** The signboard reads "BARBER SHOP", the interior sign reads "BARBERSHOP". */
  suffix: "Barbershop",
  established: 2026,
  phone: "0889775088",
  phoneDisplay: "0889 775 088",
  /** From the street signboard. The price board writes the older street name
   *  ("206 Đường số 9, Tân Mỹ") — same address, renamed. */
  address: {
    street: "206 Võ Thị Đặng",
    ward: "Phường Tân Mỹ",
    city: "TP. Hồ Chí Minh",
  },
  mapsQuery: "206 Võ Thị Đặng, Phường Tân Mỹ, TP. Hồ Chí Minh",
  // TODO(content): confirm real opening hours with the shop.
  hours: [
    { day: 1, open: "08:30", close: "20:30" },
    { day: 2, open: "08:30", close: "20:30" },
    { day: 3, open: "08:30", close: "20:30" },
    { day: 4, open: "08:30", close: "20:30" },
    { day: 5, open: "08:30", close: "20:30" },
    { day: 6, open: "08:30", close: "21:00" },
    { day: 0, open: "08:30", close: "21:00" },
  ],
  // TODO(content): real social links.
  social: {
    facebook: "",
    instagram: "",
    zalo: "",
    tiktok: "",
  },
} as const;

/** Menu order — the groups as the shop lists them, packages first. */
export const SERVICE_GROUPS = ["package", "relax", "colour", "perm"] as const;
export type ServiceGroup = (typeof SERVICE_GROUPS)[number];

export type Service = {
  slug: string;
  group: ServiceGroup;
  /** Order within its group. */
  rank: number;
  nameVi: string;
  nameEn: string;
  /** Price in đồng. For a range this is the low end. */
  price: number;
  /** High end of a price range ("350K – 450K"), else null. */
  priceMax: number | null;
  /** Original price when the shop advertises a discount, else null. */
  wasPrice: number | null;
  /** Rough chair time in minutes — used to size a booking slot. */
  minutes: number;
  includesVi: string[];
  includesEn: string[];
  /** One-line description under a package, else null. */
  taglineVi: string | null;
  taglineEn: string | null;
};

/**
 * The menu as the shop wrote it for the site (September 2026), which
 * supersedes the opening-day price board. Slugs that were on the board are
 * kept so existing bookings still resolve; anything the shop dropped is
 * deactivated by the seed, not deleted.
 */
export const services: Service[] = [
  {
    slug: "goi-cat-toc",
    group: "package",
    rank: 1,
    nameVi: "Cắt & xả tóc",
    nameEn: "Haircut & Rinse",
    price: 120_000,
    priceMax: null,
    wasPrice: null,
    minutes: 40,
    includesVi: ["Cắt tóc nam", "Xả tóc"],
    includesEn: ["Men's haircut", "Hair rinse"],
    taglineVi: null,
    taglineEn: null,
  },
  {
    slug: "goi-trai-nghiem",
    group: "package",
    rank: 2,
    nameVi: "The Corner Experience",
    nameEn: "The Corner Experience",
    price: 199_000,
    priceMax: null,
    wasPrice: null,
    minutes: 60,
    includesVi: ["Cắt tóc nam", "Gội đầu", "Tẩy da chết", "Gội thư giãn", "Tạo kiểu"],
    includesEn: [
      "Men's haircut",
      "Hair wash",
      "Scalp exfoliation",
      "Relaxing hair wash",
      "Styling",
    ],
    taglineVi: "Một trải nghiệm được thiết kế để bạn thư giãn và trở nên chỉn chu hơn.",
    taglineEn:
      "A grooming experience designed to help you relax and leave feeling refreshed and well-groomed.",
  },
  {
    slug: "goi-cham-soc-toan-dien",
    group: "package",
    rank: 3,
    nameVi: "Chăm sóc toàn diện",
    nameEn: "Full Grooming Experience",
    price: 399_000,
    priceMax: null,
    wasPrice: null,
    minutes: 105,
    includesVi: [
      "Cắt tóc nam",
      "Gội đầu",
      "Tẩy da chết",
      "Gội thư giãn",
      "Massage đầu",
      "Massage mặt",
      "Đắp mặt",
      "Cắt móng tay",
      "Tạo kiểu",
    ],
    includesEn: [
      "Men's haircut",
      "Hair wash",
      "Scalp exfoliation",
      "Relaxing hair wash",
      "Head massage",
      "Facial massage",
      "Facial mask",
      "Nail care",
      "Styling",
    ],
    taglineVi: "Chăm sóc trọn vẹn từ đầu đến cuối.",
    taglineEn: "A complete grooming experience from start to finish.",
  },

  single("ray-tai", "relax", 1, "Ráy tai", "Ear cleaning", 90_000, null, 20),
  single(
    "co-vai-gay-da-nong",
    "relax",
    2,
    "Cổ vai gáy đá nóng",
    "Hot stone neck & shoulder massage",
    150_000,
    null,
    30,
  ),
  single("head-spa", "relax", 3, "Head Spa", "Relaxing head spa", 150_000, null, 45),

  single("nhuom-den", "colour", 1, "Nhuộm đen", "Black hair colour", 200_000, null, 60),
  single("mau-co-ban", "colour", 2, "Màu cơ bản", "Basic hair colour", 350_000, 450_000, 90),
  single(
    "mau-thoi-trang",
    "colour",
    3,
    "Màu thời trang",
    "Fashion hair colour",
    450_000,
    600_000,
    120,
  ),
  single("tay-toc", "colour", 4, "Tẩy tóc", "Hair bleaching", 250_000, 350_000, 75),

  single("uon-toc", "perm", 1, "Uốn tóc", "Classic hair perm", 350_000, 450_000, 105),
  single("uon-con-sau", "perm", 2, "Uốn con sâu", "Texture perm", 550_000, 650_000, 120),
];

/** A single service has no inclusions or tagline; this keeps the list readable. */
function single(
  slug: string,
  group: Exclude<ServiceGroup, "package">,
  rank: number,
  nameVi: string,
  nameEn: string,
  price: number,
  priceMax: number | null,
  minutes: number,
): Service {
  return {
    slug,
    group,
    rank,
    nameVi,
    nameEn,
    price,
    priceMax,
    wasPrice: null,
    minutes,
    includesVi: [],
    includesEn: [],
    taglineVi: null,
    taglineEn: null,
  };
}

/**
 * TODO(content): real barber names and photos. Until the shop supplies them,
 * booking offers "any barber" plus these placeholders, which admin can rename.
 */
export const barbers = [
  { slug: "any", nameVi: "Thợ bất kỳ", nameEn: "Any barber", photoId: null },
  { slug: "barber-1", nameVi: "Thợ 1", nameEn: "Barber 1", photoId: "craft-style-portrait" },
  { slug: "barber-2", nameVi: "Thợ 2", nameEn: "Barber 2", photoId: "craft-cut-side" },
  { slug: "barber-3", nameVi: "Thợ 3", nameEn: "Barber 3", photoId: "craft-cut-window" },
] as const;

/** Formats đồng the way the shop's own board does: `120.000đ`. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

/** A service's price, or its range: `350.000đ – 450.000đ`. */
export function formatPrice(service: Pick<Service, "price" | "priceMax">): string {
  return service.priceMax === null
    ? formatVnd(service.price)
    : `${formatVnd(service.price)} – ${formatVnd(service.priceMax)}`;
}

/**
 * Today's date in the shop's timezone, as `YYYY-MM-DD`.
 *
 * The booking form needs a `min` for its date field. Deriving it from the
 * visitor's clock would be wrong for anyone browsing from another timezone —
 * the only date that matters is the one on the wall in Ho Chi Minh City.
 */
export function shopToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function mapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}`;
}
