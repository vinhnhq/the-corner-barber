/**
 * Server-rendered dictionaries. Vietnamese is the source of truth and English
 * is typed against it, so a missing translation is a compile error rather than
 * a blank string at runtime.
 *
 * No client i18n runtime and no locale route segments: the locale comes from a
 * cookie, is read in a Server Component, and the right strings are rendered.
 */

/**
 * The shape both languages must fill. Written out rather than inferred from the
 * Vietnamese object so that adding a key is a deliberate edit in one place and
 * an unfilled key is a compile error in the other.
 */
export type Dictionary = {
  nav: Record<"home" | "services" | "space" | "book" | "contact", string>;
  /** Headings may wrap one phrase in `*…*`; it renders as the italic gold accent. */
  hero: {
    eyebrow: string;
    headline: string;
    lede: string;
    book: string;
    call: string;
    note: string;
    scroll: string;
    stats: { value: string; label: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    body: string;
  };
  services: {
    eyebrow: string;
    title: string;
    /** "Gói {n}" — the numbered label above each package. */
    package: string;
    signatureEyebrow: string;
    signatureTitle: string;
    groups: Record<"relax" | "colour" | "perm", string>;
    includes: string;
    was: string;
    minutes: string;
    book: string;
  };
  space: {
    eyebrow: string;
    title: string;
    lede: string;
    /** "Gỗ ấm · Ánh sáng dịu · Âm nhạc vừa đủ" */
    notes: string[];
    open: string;
    close: string;
    prev: string;
    next: string;
    counter: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    steps: { title: string; body: string }[];
  };
  booking: Record<
    | "eyebrow"
    | "title"
    | "lede"
    | "stepService"
    | "stepWhen"
    | "stepDetails"
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
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    eyebrow: string;
    title: string;
    body: string;
    book: string;
    call: string;
  };
  bar: { book: string; call: string };
  contact: {
    tagline: string;
    nav: string;
    reach: string;
    address: string;
    hours: string;
    phone: string;
    directions: string;
    /** Sunday first, indexed by `Date#getDay`. */
    days: string[];
    rights: string;
    language: string;
  };
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
    home: "Trang chủ",
    services: "Dịch vụ",
    space: "Không gian",
    book: "Đặt lịch",
    contact: "Liên hệ",
  },
  hero: {
    eyebrow: "Barbershop · 206 Võ Thị Đặng, TP. HCM",
    headline: "Không ồn ào. *Không vội vã.*",
    lede: "Chỉ là một không gian nơi người đàn ông tìm lại sự chỉn chu của mình.",
    book: "Đặt lịch",
    call: "Gọi tiệm",
    note: "Đặt lịch miễn phí · Tiệm gọi lại xác nhận · Nhận khách vãng lai",
    scroll: "Cuộn xuống",
    stats: [
      { value: "4", label: "ghế cắt" },
      { value: "12", label: "dịch vụ" },
      { value: "2026", label: "năm mở tiệm" },
    ],
  },
  about: {
    eyebrow: "Về The Corner",
    title: "Một góc riêng *cho người đàn ông.*",
    body: "The Corner là một không gian dành cho những người đàn ông muốn chăm sóc bản thân trong sự thoải mái và chỉn chu.",
  },
  services: {
    eyebrow: "Bảng giá",
    title: "Ba gói, *một tiêu chuẩn.*",
    package: "Gói {n}",
    signatureEyebrow: "Dịch vụ riêng",
    signatureTitle: "Chọn thêm *theo nhu cầu.*",
    groups: {
      relax: "Thư giãn",
      colour: "Nhuộm & tẩy tóc",
      perm: "Uốn tóc",
    },
    includes: "Bao gồm",
    was: "Giá gốc",
    minutes: "phút",
    book: "Đặt gói này",
  },
  space: {
    eyebrow: "Không gian",
    title: "Bốn ghế, *vừa đủ riêng tư.*",
    lede: "Một không gian vừa đủ riêng tư để bạn thư giãn và tận hưởng thời gian dành cho bản thân.",
    notes: ["Gỗ ấm", "Ánh sáng dịu", "Âm nhạc vừa đủ"],
    open: "Xem ảnh",
    close: "Đóng",
    prev: "Ảnh trước",
    next: "Ảnh sau",
    counter: "{current} / {total}",
  },
  experience: {
    eyebrow: "Trải nghiệm",
    title: "Bốn bước, *không vội.*",
    steps: [
      { title: "Tư vấn", body: "Hiểu mái tóc và phong cách của bạn." },
      { title: "Cắt", body: "Tập trung vào từng đường kéo và từng chi tiết." },
      { title: "Chăm sóc", body: "Thư giãn và chăm sóc theo nhu cầu." },
      { title: "Hoàn thiện", body: "Hoàn thiện mái tóc và diện mạo của bạn." },
    ],
  },
  booking: {
    eyebrow: "Đặt lịch",
    title: "Giữ ghế *cho bạn.*",
    lede: "Gửi yêu cầu, tiệm sẽ gọi lại xác nhận trong thời gian sớm nhất.",
    stepService: "Chọn dịch vụ",
    stepWhen: "Chọn ngày & giờ",
    stepDetails: "Thông tin khách hàng",
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
    submit: "Xác nhận đặt lịch",
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
  faq: {
    eyebrow: "Câu hỏi thường gặp",
    title: "Những điều *cần biết.*",
    items: [
      {
        q: "Không đặt lịch có cắt được không?",
        a: "Được. Tiệm nhận khách vãng lai; đặt lịch trước chỉ để bạn không phải chờ ghế.",
      },
      {
        q: "Đặt lịch xong thì sao?",
        a: "Tiệm gọi lại số bạn để xác nhận giờ. Nếu cần dời, cứ nhắn hoặc gọi hotline.",
      },
      {
        q: "Một lần cắt mất bao lâu?",
        a: "Gói Cắt & xả khoảng 40 phút. The Corner Experience khoảng một giờ, Chăm sóc toàn diện gần hai giờ.",
      },
      {
        q: "Thanh toán thế nào?",
        a: "Tiền mặt hoặc chuyển khoản tại tiệm. Giá niêm yết đúng như bảng, không phụ thu.",
      },
      {
        q: "Có chỗ để xe không?",
        a: "Có chỗ để xe máy ngay trước tiệm.",
      },
      {
        q: "Nhuộm, uốn có cần đặt trước không?",
        a: "Nên đặt trước — các dịch vụ này cần 1,5–2 giờ và tiệm sẽ giữ ghế cho bạn.",
      },
    ],
  },
  cta: {
    eyebrow: "Sẵn sàng",
    title: "Đến The Corner, *chậm lại một chút.*",
    body: "Đặt lịch trong một phút, hoặc gọi thẳng cho tiệm.",
    book: "Đặt lịch",
    call: "Gọi tiệm",
  },
  bar: { book: "Đặt lịch", call: "Gọi" },
  contact: {
    tagline: "Không ồn ào. Không vội vã.",
    nav: "Điều hướng",
    reach: "Liên hệ",
    address: "Địa chỉ",
    hours: "Giờ mở cửa",
    phone: "Hotline",
    directions: "Google Maps",
    days: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
    rights: "Bảo lưu mọi quyền.",
    language: "Ngôn ngữ",
  },
};

/** English mirrors the Vietnamese shape exactly — enforced by the type below. */
const en: Dictionary = {
  nav: {
    home: "Home",
    services: "Services",
    space: "Space",
    book: "Booking",
    contact: "Contact",
  },
  hero: {
    eyebrow: "Barbershop · 206 Võ Thị Đặng, Ho Chi Minh City",
    headline: "Quiet. *Unhurried.*",
    lede: "A space where a man can slow down and rediscover his sense of refinement.",
    book: "Book an appointment",
    call: "Call the shop",
    note: "Free to book · The shop calls to confirm · Walk-ins welcome",
    scroll: "Scroll",
    stats: [
      { value: "4", label: "barber chairs" },
      { value: "12", label: "services" },
      { value: "2026", label: "established" },
    ],
  },
  about: {
    eyebrow: "About The Corner",
    title: "A private corner *for men.*",
    body: "The Corner is a space for men who value personal care, comfort, and attention to detail.",
  },
  services: {
    eyebrow: "Price list",
    title: "Three packages, *one standard.*",
    package: "Package {n}",
    signatureEyebrow: "Signature services",
    signatureTitle: "Add *what you need.*",
    groups: {
      relax: "Relaxation",
      colour: "Hair colour & bleach",
      perm: "Hair perm",
    },
    includes: "Includes",
    was: "Was",
    minutes: "min",
    book: "Book this",
  },
  space: {
    eyebrow: "The space",
    title: "Four chairs, *just private enough.*",
    lede: "A thoughtfully designed space where you can relax and enjoy time for yourself.",
    notes: ["Warm wood", "Soft lighting", "Just the right music"],
    open: "View photo",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    counter: "{current} of {total}",
  },
  experience: {
    eyebrow: "The experience",
    title: "Four steps, *unhurried.*",
    steps: [
      { title: "Consultation", body: "Understanding your hair and personal style." },
      { title: "Haircut", body: "Attention to every cut and detail." },
      { title: "Grooming", body: "Relax and enjoy personalized grooming." },
      { title: "Finishing", body: "Finishing your look with care and precision." },
    ],
  },
  booking: {
    eyebrow: "Booking",
    title: "Hold a chair *for you.*",
    lede: "Send a request and the shop will call you back to confirm.",
    stepService: "Select a service",
    stepWhen: "Select date & time",
    stepDetails: "Your information",
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
    submit: "Confirm booking",
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
  faq: {
    eyebrow: "Questions",
    title: "Good *to know.*",
    items: [
      {
        q: "Can I come without booking?",
        a: "Yes. Walk-ins are welcome; booking just means you will not wait for a chair.",
      },
      {
        q: "What happens after I book?",
        a: "The shop calls your number to confirm the time. Need to move it? Message or call the hotline.",
      },
      {
        q: "How long does a visit take?",
        a: "Haircut & Rinse is about 40 minutes. The Corner Experience is about an hour; the Full Grooming Experience close to two.",
      },
      {
        q: "How do I pay?",
        a: "Cash or bank transfer at the shop. Prices are as listed — no surcharges.",
      },
      {
        q: "Is there parking?",
        a: "Motorbike parking right in front of the shop.",
      },
      {
        q: "Do colour and perms need a booking?",
        a: "Best to book — they take 1.5–2 hours and the shop will hold the chair for you.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready when you are",
    title: "Come to The Corner, *slow down a little.*",
    body: "Book in a minute, or call the shop directly.",
    book: "Book an appointment",
    call: "Call the shop",
  },
  bar: { book: "Book", call: "Call" },
  contact: {
    tagline: "Quiet. Unhurried.",
    nav: "Navigate",
    reach: "Contact",
    address: "Address",
    hours: "Opening hours",
    phone: "Phone",
    directions: "Google Maps",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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
