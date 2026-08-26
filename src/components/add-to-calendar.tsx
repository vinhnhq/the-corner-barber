"use client";

import { CalendarPlus, Download } from "lucide-react";
import type { ConfirmedAppointment } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import {
  googleCalendarUrl,
  icsFile,
  icsFileName,
  type CustomerAppointment,
} from "@/lib/calendar-links";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Lets the customer put their own appointment in their own calendar.
 *
 * Google gets a prefilled template URL; everyone else gets an `.ics`. The file
 * is built in the browser from data already on screen and handed over as a
 * blob, so there is no endpoint serving bookings by id and nothing to secure.
 */
export function AddToCalendar({
  appointment,
  t,
}: {
  appointment: ConfirmedAppointment;
  t: Dictionary;
}) {
  const details: CustomerAppointment = appointment;

  const downloadIcs = () => {
    const blob = new Blob([icsFile(details)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = icsFileName(details);
    link.click();

    // Revoking immediately can race the download in some browsers; a tick is
    // enough for the click to have been handed off.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button asChild variant="outline" size="sm">
        <a href={googleCalendarUrl(details)} target="_blank" rel="noreferrer noopener">
          <CalendarPlus className="size-4" aria-hidden />
          {t.booking.addToGoogle}
        </a>
      </Button>

      <Button type="button" variant="ghost" size="sm" onClick={downloadIcs}>
        <Download className="size-4" aria-hidden />
        {t.booking.downloadIcs}
      </Button>
    </div>
  );
}
