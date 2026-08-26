/**
 * Everything the shop publishes about itself.
 *
 * The services, prices, address and phone number below were transcribed from
 * the shop's own price board and street signboard in the opening-day photos
 * (`P7250600.JPG` and `P7250619.JPG`), so they are real, not placeholder.
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

export type ServiceGroup = "package" | "single" | "colour";

export type Service = {
  slug: string;
  group: ServiceGroup;
  /** Order within its group. */
  rank: number;
  nameVi: string;
  nameEn: string;
  /** Price in đồng. */
  price: number;
  /** Original price when the shop advertises a discount, else null. */
  wasPrice: number | null;
  /** Rough chair time in minutes — used to size a booking slot. */
  minutes: number;
  includesVi: string[];
  includesEn: string[];
};

/**
 * The full menu from the price board. `GÓI TRẢI NGHIỆM` is the one item the
 * board shows discounted (285.000đ struck through, 199.000đ after -30%).
 */
export const services: Service[] = [
  {
    slug: "goi-cat-toc",
    group: "package",
    rank: 1,
    nameVi: "Gói cắt tóc",
    nameEn: "The Cut",
    price: 120_000,
    wasPrice: null,
    minutes: 40,
    includesVi: ["Xả tóc", "Cắt tóc", "Tạo kiểu tóc"],
    includesEn: ["Hair rinse", "Haircut", "Styling"],
  },
  {
    slug: "goi-trai-nghiem",
    group: "package",
    rank: 2,
    nameVi: "Gói trải nghiệm",
    nameEn: "The Experience",
    price: 199_000,
    wasPrice: 285_000,
    minutes: 60,
    includesVi: ["Xả tóc", "Cắt tóc", "Tạo kiểu tóc", "Gội thư giãn", "Tẩy tế bào chết da mặt"],
    includesEn: ["Hair rinse", "Haircut", "Styling", "Relaxing shampoo", "Facial exfoliation"],
  },
  {
    slug: "goi-cham-soc-toan-dien",
    group: "package",
    rank: 3,
    nameVi: "Gói chăm sóc toàn diện",
    nameEn: "The Full Service",
    price: 399_000,
    wasPrice: null,
    minutes: 105,
    includesVi: [
      "Xả tóc",
      "Cắt tóc",
      "Tạo kiểu tóc",
      "Gội thư giãn",
      "Tẩy tế bào chết da mặt",
      "Đắp mặt nạ",
      "Massage mặt",
      "Massage da đầu",
      "Chăm sóc móng tay",
      "Chăm sóc móng chân",
    ],
    includesEn: [
      "Hair rinse",
      "Haircut",
      "Styling",
      "Relaxing shampoo",
      "Facial exfoliation",
      "Face mask",
      "Face massage",
      "Scalp massage",
      "Manicure",
      "Pedicure",
    ],
  },

  {
    slug: "cao-mat",
    group: "single",
    rank: 1,
    nameVi: "Cạo mặt",
    nameEn: "Face shave",
    price: 20_000,
    wasPrice: null,
    minutes: 15,
    includesVi: [],
    includesEn: [],
  },
  {
    slug: "cao-rau",
    group: "single",
    rank: 2,
    nameVi: "Cạo râu",
    nameEn: "Beard shave",
    price: 50_000,
    wasPrice: null,
    minutes: 20,
    includesVi: [],
    includesEn: [],
  },
  {
    slug: "goi-dau",
    group: "single",
    rank: 3,
    nameVi: "Gội đầu",
    nameEn: "Shampoo",
    price: 70_000,
    wasPrice: null,
    minutes: 25,
    includesVi: [],
    includesEn: [],
  },

  {
    slug: "nhuom-den",
    group: "colour",
    rank: 1,
    nameVi: "Nhuộm đen",
    nameEn: "Black colour",
    price: 200_000,
    wasPrice: null,
    minutes: 60,
    includesVi: [],
    includesEn: [],
  },
  {
    slug: "nhuom-nau",
    group: "colour",
    rank: 2,
    nameVi: "Nhuộm nâu",
    nameEn: "Brown colour",
    price: 300_000,
    wasPrice: null,
    minutes: 75,
    includesVi: [],
    includesEn: [],
  },
  {
    slug: "tay-toc",
    group: "colour",
    rank: 3,
    nameVi: "Tẩy tóc",
    nameEn: "Bleach",
    price: 250_000,
    wasPrice: null,
    minutes: 75,
    includesVi: [],
    includesEn: [],
  },
  {
    slug: "uon-toc",
    group: "colour",
    rank: 4,
    nameVi: "Uốn tóc",
    nameEn: "Perm",
    price: 350_000,
    wasPrice: null,
    minutes: 105,
    includesVi: [],
    includesEn: [],
  },
  {
    slug: "uon-con-sau",
    group: "colour",
    rank: 5,
    nameVi: "Uốn con sâu",
    nameEn: "Curly perm",
    price: 450_000,
    wasPrice: null,
    minutes: 120,
    includesVi: [],
    includesEn: [],
  },
];

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
