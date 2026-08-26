/**
 * Server-rendered dictionaries. Vietnamese is the source of truth and English
 * is typed against it, so a missing translation is a compile error rather than
 * a blank string at runtime.
 *
 * No client i18n runtime and no locale route segments: the locale comes from a
 * cookie, is read in a Server Component, and the right strings are rendered.
 */

import { shop } from "@/lib/shop";

/**
 * The shape both languages must fill. Written out rather than inferred from the
 * Vietnamese object so that adding a key is a deliberate edit in one place and
 * an unfilled key is a compile error in the other.
 */
export type Dictionary = {
  nav: Record<"services" | "gallery" | "barbers" | "about" | "visit" | "book", string>;
  hero: Record<"eyebrow" | "headline" | "lede" | "book" | "seeServices" | "scroll", string>;
  services: Record<
    | "eyebrow"
    | "title"
    | "lede"
    | "packages"
    | "singles"
    | "colour"
    | "includes"
    | "from"
    | "was"
    | "save"
    | "minutes"
    | "book",
    string
  >;
  gallery: Record<
    "eyebrow" | "title" | "lede" | "open" | "close" | "prev" | "next" | "counter",
    string
  >;
  barbers: Record<"eyebrow" | "title" | "lede", string>;
  about: {
    eyebrow: string;
    title: string;
    body: string[];
    stats: Record<"established" | "chairs" | "services", string>;
  };
  visit: {
    eyebrow: string;
    title: string;
    address: string;
    phone: string;
    hours: string;
    directions: string;
    call: string;
    /** Sunday first, indexed by `Date#getDay`. */
    days: string[];
    today: string;
    openNow: string;
    closedNow: string;
  };
  booking: Record<
    | "eyebrow"
    | "title"
    | "lede"
    | "name"
    | "namePlaceholder"
    | "phone"
    | "phonePlaceholder"
    | "service"
    | "servicePlaceholder"
    | "barber"
    | "barberAny"
    | "date"
    | "time"
    | "note"
    | "notePlaceholder"
    | "submit"
    | "submitting"
    | "successTitle"
    | "successBody"
    | "errorTitle"
    | "errorBody"
    | "required"
    | "invalidPhone"
    | "pastDate"
    | "rateLimited"
    | "addToCalendar"
    | "addToGoogle"
    | "downloadIcs"
    | "slotTaken"
    | "dayFull",
    string
  >;
  footer: Record<"tagline" | "rights" | "language", string>;
};

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

const vi: Dictionary = {
  nav: {
    services: "Dịch vụ",
    gallery: "Không gian",
    barbers: "Thợ",
    about: "Về tiệm",
    visit: "Ghé tiệm",
    book: "Đặt lịch",
  },
  hero: {
    eyebrow: "Tiệm cắt tóc cổ điển",
    headline: "Chỗ ngồi quen của bạn, ở góc đường",
    lede: "Ghế da, gương gỗ, đèn đồng. Một chỗ cắt tóc tử tế — làm chậm, làm kỹ, làm cho ra dáng.",
    book: "Đặt lịch",
    seeServices: "Xem bảng giá",
    scroll: "Cuộn xuống",
  },
  services: {
    eyebrow: "Bảng giá dịch vụ",
    title: "Chọn gói của bạn",
    lede: "Giá niêm yết đúng như bảng treo tại tiệm. Không phụ thu, không phát sinh.",
    packages: "Gói dịch vụ",
    singles: "Dịch vụ lẻ",
    colour: "Uốn & nhuộm",
    includes: "Bao gồm",
    from: "Chỉ từ",
    was: "Giá gốc",
    save: "Giảm 30%",
    minutes: "phút",
    book: "Đặt gói này",
  },
  gallery: {
    eyebrow: "Không gian",
    title: "Bên trong tiệm",
    lede: "Tường xanh ô liu, gỗ gụ, đèn chùm — dựng lại một tiệm cắt tóc kiểu cũ giữa Sài Gòn.",
    open: "Xem ảnh",
    close: "Đóng",
    prev: "Ảnh trước",
    next: "Ảnh sau",
    counter: "{current} / {total}",
  },
  barbers: {
    eyebrow: "Đội ngũ",
    title: "Người cầm kéo",
    lede: "Mỗi ghế một người thợ. Bạn có thể chọn thợ quen, hoặc để tiệm sắp xếp.",
  },
  about: {
    eyebrow: `Est. ${shop.established}`,
    title: "Một tiệm cắt tóc, làm cho đàng hoàng",
    body: [
      "The Corner mở cửa năm 2026 ở góc đường Võ Thị Đặng — một căn nhà nhỏ được dựng lại thành tiệm cắt tóc kiểu cổ điển: tường xanh ô liu, khung gỗ gụ chạm tay, đèn đồng và ghế da xanh.",
      "Ở đây không có gì vội. Gội, cắt, cạo, tạo kiểu — từng bước làm đủ, làm kỹ. Khách ngồi xuống là được pha nước, được hỏi kỹ kiểu tóc, rồi mới bắt đầu.",
    ],
    stats: {
      established: "Năm mở tiệm",
      chairs: "Ghế cắt",
      services: "Dịch vụ",
    },
  },
  visit: {
    eyebrow: "Ghé tiệm",
    title: "Tìm chúng tôi",
    address: "Địa chỉ",
    phone: "Điện thoại",
    hours: "Giờ mở cửa",
    directions: "Chỉ đường",
    call: "Gọi ngay",
    days: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
    today: "Hôm nay",
    openNow: "Đang mở cửa",
    closedNow: "Đã đóng cửa",
  },
  booking: {
    eyebrow: "Đặt lịch",
    title: "Giữ ghế cho bạn",
    lede: "Gửi yêu cầu, tiệm sẽ gọi lại xác nhận trong thời gian sớm nhất.",
    name: "Họ và tên",
    namePlaceholder: "Nguyễn Văn A",
    phone: "Số điện thoại",
    phonePlaceholder: "09xx xxx xxx",
    service: "Dịch vụ",
    servicePlaceholder: "Chọn dịch vụ",
    barber: "Thợ",
    barberAny: "Thợ bất kỳ",
    date: "Ngày",
    time: "Giờ",
    note: "Ghi chú",
    notePlaceholder: "Kiểu tóc mong muốn, yêu cầu riêng…",
    submit: "Gửi yêu cầu",
    submitting: "Đang gửi…",
    successTitle: "Đã nhận yêu cầu",
    successBody: "Tiệm sẽ gọi lại số {phone} để xác nhận. Cảm ơn bạn!",
    errorTitle: "Chưa gửi được",
    errorBody: "Vui lòng thử lại, hoặc gọi trực tiếp {phone}.",
    required: "Vui lòng điền mục này",
    invalidPhone: "Số điện thoại chưa đúng",
    pastDate: "Vui lòng chọn ngày từ hôm nay trở đi",
    rateLimited: "Bạn vừa gửi một yêu cầu. Vui lòng thử lại sau ít phút.",
    addToCalendar: "Lưu vào lịch của bạn",
    addToGoogle: "Google Calendar",
    downloadIcs: "Tải file .ics",
    slotTaken: "đã kín",
    dayFull: "Ngày này đã kín lịch. Vui lòng chọn ngày khác.",
  },
  footer: {
    tagline: "Tiệm cắt tóc cổ điển tại TP. Hồ Chí Minh",
    rights: "Bảo lưu mọi quyền.",
    language: "Ngôn ngữ",
  },
};

/** English mirrors the Vietnamese shape exactly — enforced by the type below. */
const en: Dictionary = {
  nav: {
    services: "Services",
    gallery: "The Room",
    barbers: "Barbers",
    about: "About",
    visit: "Visit",
    book: "Book",
  },
  hero: {
    eyebrow: "A classic barbershop",
    headline: "Your chair is waiting, on the corner",
    lede: "Leather seats, carved mirrors, brass light. A proper haircut — taken slowly, done thoroughly, finished properly.",
    book: "Book a chair",
    seeServices: "See the price list",
    scroll: "Scroll",
  },
  services: {
    eyebrow: "Price list",
    title: "Choose your package",
    lede: "The same prices as the board on the wall. No surcharges, no surprises.",
    packages: "Packages",
    singles: "Individual services",
    colour: "Perm & colour",
    includes: "Includes",
    from: "From",
    was: "Was",
    save: "Save 30%",
    minutes: "min",
    book: "Book this",
  },
  gallery: {
    eyebrow: "The room",
    title: "Inside the shop",
    lede: "Olive walls, mahogany millwork, a chandelier — an old-fashioned barbershop rebuilt in Saigon.",
    open: "View photo",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    counter: "{current} of {total}",
  },
  barbers: {
    eyebrow: "The team",
    title: "Behind the chair",
    lede: "One barber to a chair. Ask for your regular, or let the shop choose.",
  },
  about: {
    eyebrow: `Est. ${shop.established}`,
    title: "One barbershop, done properly",
    body: [
      "The Corner opened in 2026 on the corner of Võ Thị Đặng — a small building rebuilt as a classic barbershop: olive walls, hand-carved mahogany frames, brass lamps and green leather chairs.",
      "Nothing here is rushed. Wash, cut, shave, style — every step given its time. You sit down, you get a drink, you get asked what you actually want, and only then does the work start.",
    ],
    stats: {
      established: "Established",
      chairs: "Chairs",
      services: "Services",
    },
  },
  visit: {
    eyebrow: "Visit",
    title: "Find us",
    address: "Address",
    phone: "Phone",
    hours: "Opening hours",
    directions: "Directions",
    call: "Call now",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    today: "Today",
    openNow: "Open now",
    closedNow: "Closed",
  },
  booking: {
    eyebrow: "Booking",
    title: "Hold a chair",
    lede: "Send a request and the shop will call you back to confirm.",
    name: "Full name",
    namePlaceholder: "Alex Nguyen",
    phone: "Phone number",
    phonePlaceholder: "09xx xxx xxx",
    service: "Service",
    servicePlaceholder: "Choose a service",
    barber: "Barber",
    barberAny: "Any barber",
    date: "Date",
    time: "Time",
    note: "Note",
    notePlaceholder: "The style you want, anything we should know…",
    submit: "Send request",
    submitting: "Sending…",
    successTitle: "Request received",
    successBody: "The shop will call {phone} to confirm. Thank you!",
    errorTitle: "Could not send",
    errorBody: "Please try again, or call {phone} directly.",
    required: "This field is required",
    invalidPhone: "That phone number does not look right",
    pastDate: "Please choose today or a later date",
    rateLimited: "You just sent a request. Please try again in a few minutes.",
    addToCalendar: "Save it to your calendar",
    addToGoogle: "Google Calendar",
    downloadIcs: "Download .ics",
    slotTaken: "fully booked",
    dayFull: "This day is fully booked. Please pick another date.",
  },
  footer: {
    tagline: "A classic barbershop in Ho Chi Minh City",
    rights: "All rights reserved.",
    language: "Language",
  },
};

const dictionaries: Record<Locale, Dictionary> = { vi, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Fills `{name}` placeholders: `t("Call {phone}", { phone })`. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
