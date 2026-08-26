/**
 * The curated shortlist, picked from the 286 source frames via the contact
 * sheets in `scratch/sheets/`.
 *
 * `id` is the stable public filename. `slot` groups pictures by where they are
 * used so a section can ask for its own set without hard-coding filenames.
 * To swap a picture, change `src` here and re-run `bun run assets:photos`.
 */
export type PhotoSlot = "hero" | "interior" | "craft" | "detail" | "exterior";

export type PhotoPick = {
  id: string;
  slot: PhotoSlot;
  src: string;
  /** Short description, used as the default alt text. */
  alt: string;
};

const SHOP = "_source-assets/Ảnh của tiệm a Felix";
const OPENING = "_source-assets/Ảnh khai trương tiệm a Felix";

export const PHOTOS: PhotoPick[] = [
  // — hero / atmosphere ————————————————————————————————
  {
    id: "hero-room",
    slot: "hero",
    src: `${SHOP}/P7230506.JPG`,
    alt: "Không gian tiệm nhìn ra cửa chính",
  },
  {
    id: "hero-stations",
    slot: "hero",
    src: `${SHOP}/P7230459.JPG`,
    alt: "Dãy ghế cắt tóc và gương gỗ",
  },
  {
    id: "hero-chandelier",
    slot: "hero",
    src: `${SHOP}/P7230537.JPG`,
    alt: "Đèn chùm và đèn thả công nghiệp",
  },
  { id: "hero-sconces", slot: "hero", src: `${SHOP}/P7230540.JPG`, alt: "Dãy đèn tường đồng" },

  // — interior / gallery ————————————————————————————————
  {
    id: "interior-lounge-arch",
    slot: "interior",
    src: `${SHOP}/P7230404.JPG`,
    alt: "Khu chờ với ghế sofa da và vòm cửa",
  },
  {
    id: "interior-sign-sofa",
    slot: "interior",
    src: `${SHOP}/P7230450.JPG`,
    alt: "Bảng hiệu vàng và ghế sofa Chesterfield",
  },
  {
    id: "interior-lounge",
    slot: "interior",
    src: `${SHOP}/P7230446.JPG`,
    alt: "Khu chờ với ghế thư giãn",
  },
  {
    id: "interior-stations",
    slot: "interior",
    src: `${SHOP}/P7230425.JPG`,
    alt: "Dãy bàn làm việc của thợ",
  },
  {
    id: "interior-station-one",
    slot: "interior",
    src: `${SHOP}/P7230451.JPG`,
    alt: "Một bàn gương gỗ và ghế cắt tóc",
  },
  { id: "interior-wide", slot: "interior", src: `${SHOP}/P7230496.JPG`, alt: "Toàn cảnh tiệm" },
  {
    id: "interior-mirrors",
    slot: "interior",
    src: `${SHOP}/P7230507.JPG`,
    alt: "Hàng gương chạm khắc",
  },
  {
    id: "interior-sign-wall",
    slot: "interior",
    src: `${OPENING}/P7250667.JPG`,
    alt: "Bảng hiệu The Corner Barbershop trên tường",
  },

  // — craft / services ————————————————————————————————
  {
    id: "craft-cut-cape",
    slot: "craft",
    src: `${OPENING}/P7250571.JPG`,
    alt: "Thợ đang cắt tóc cho khách",
  },
  {
    id: "craft-cut-side",
    slot: "craft",
    src: `${OPENING}/P7250582.JPG`,
    alt: "Cắt tóc bên bàn gương",
  },
  {
    id: "craft-cut-window",
    slot: "craft",
    src: `${OPENING}/P7250670.JPG`,
    alt: "Cắt tóc bên cửa kính",
  },
  { id: "craft-style", slot: "craft", src: `${OPENING}/P7250727.JPG`, alt: "Tạo kiểu tóc" },
  {
    id: "craft-style-portrait",
    slot: "craft",
    src: `${OPENING}/P7250732.JPG`,
    alt: "Thợ tạo kiểu cho khách",
  },
  { id: "craft-finish", slot: "craft", src: `${OPENING}/P7250741.JPG`, alt: "Kiểu tóc hoàn thiện" },
  {
    id: "craft-finish-two",
    slot: "craft",
    src: `${OPENING}/P7250748.JPG`,
    alt: "Kiểu tóc hoàn thiện",
  },
  { id: "craft-wash", slot: "craft", src: `${OPENING}/P7250628.JPG`, alt: "Gội đầu thư giãn" },
  { id: "craft-face", slot: "craft", src: `${OPENING}/P7250641.JPG`, alt: "Chăm sóc da mặt" },
  { id: "craft-massage", slot: "craft", src: `${OPENING}/P7250763.JPG`, alt: "Massage thư giãn" },
  { id: "craft-nails", slot: "craft", src: `${OPENING}/P7250674.JPG`, alt: "Chăm sóc móng tay" },
  {
    id: "craft-barber-work",
    slot: "craft",
    src: `${SHOP}/P7230401.JPG`,
    alt: "Thợ cắt tóc bên ghế da",
  },

  // — details ————————————————————————————————————————
  {
    id: "detail-razors",
    slot: "detail",
    src: `${SHOP}/P7230518.JPG`,
    alt: "Dao cạo và tông đơ trên mặt đá",
  },
  { id: "detail-tools", slot: "detail", src: `${SHOP}/P7230519.JPG`, alt: "Kéo, lược và dao cạo" },
  {
    id: "detail-razor-close",
    slot: "detail",
    src: `${SHOP}/P7230523.JPG`,
    alt: "Cận cảnh dao cạo",
  },
  {
    id: "detail-clippers",
    slot: "detail",
    src: `${SHOP}/P7230526.JPG`,
    alt: "Tông đơ trên đế sạc",
  },
  {
    id: "detail-carving",
    slot: "detail",
    src: `${SHOP}/P7230529.JPG`,
    alt: "Chi tiết chạm khắc trên gỗ",
  },
  {
    id: "detail-est-sign",
    slot: "detail",
    src: `${SHOP}/P7230534.JPG`,
    alt: "The Corner Barbershop — EST. 2026",
  },
  {
    id: "detail-portrait",
    slot: "detail",
    src: `${SHOP}/P7230508.JPG`,
    alt: "Tranh cổ điển treo tường",
  },

  // — exterior ————————————————————————————————————————
  {
    id: "exterior-front",
    slot: "exterior",
    src: `${OPENING}/P7250614.JPG`,
    alt: "Mặt tiền tiệm với cột barber",
  },
  {
    id: "exterior-front-wide",
    slot: "exterior",
    src: `${OPENING}/P7250616.JPG`,
    alt: "Mặt tiền tiệm ngày khai trương",
  },
  {
    id: "exterior-signboard",
    slot: "exterior",
    src: `${OPENING}/P7250619.JPG`,
    alt: "Bảng hiệu The Corner Barber Shop",
  },
];
