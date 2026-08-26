import "server-only";
import { formatVnd, shop, type Service } from "@/lib/shop";

/**
 * Tells the shop a request came in.
 *
 * With no `TELEGRAM_BOT_TOKEN` configured — which is the case locally — the
 * message is written to the server console instead of being sent anywhere. That
 * keeps development free of external calls while still showing exactly what the
 * shop would receive.
 */
type BookingNotification = {
  id: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  barber: string;
  note?: string;
  service: Service | undefined;
  serviceSlug: string;
};

function composeMessage(booking: BookingNotification): string {
  const service = booking.service
    ? `${booking.service.nameVi} — ${formatVnd(booking.service.price)}`
    : booking.serviceSlug;

  return [
    `🪒 Yêu cầu đặt lịch #${booking.id}`,
    "",
    `👤 ${booking.name}`,
    `📞 ${booking.phone}`,
    `✂️ ${service}`,
    `💈 ${booking.barber}`,
    `🗓 ${booking.date} lúc ${booking.time}`,
    booking.note ? `📝 ${booking.note}` : null,
    "",
    `${shop.name} ${shop.suffix}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export async function notifyNewBooking(booking: BookingNotification): Promise<void> {
  const message = composeMessage(booking);
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.info(`[booking] Telegram not configured — would have sent:\n${message}`);
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    if (!response.ok) {
      console.error(`[booking] Telegram refused the message: ${response.status}`);
    }
  } catch (error) {
    // A failed notification must never lose the booking — the row is already
    // written, and the request still shows up in /admin.
    console.error("[booking] Telegram request failed", error);
  }
}
