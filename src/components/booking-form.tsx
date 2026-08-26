"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getBusySlots } from "@/app/actions/availability";
import { submitBooking, type BookingResult } from "@/app/actions/booking";
import { AddToCalendar } from "@/components/add-to-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fill, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatVnd, shop, type Service } from "@/lib/shop";
import { slotTimes, type DateOption } from "@/lib/slots";
import { cn } from "@/lib/utils";

type BookingFormProps = {
  t: Dictionary;
  locale: Locale;
  services: Service[];
  barbers: { slug: string; nameVi: string; nameEn: string }[];
  /** `YYYY-MM-DD` in the shop's timezone, resolved on the server. */
  today: string;
  /** Selectable days, laid out and formatted on the server. */
  dates: DateOption[];
};

type State = BookingResult | null;

const DEFAULT_TIME = "09:00";

/**
 * Form controls are 36px by default, which is comfortable with a mouse and
 * fiddly with a thumb. They grow to 44px — the usual minimum touch target —
 * below the `sm` breakpoint and return to the compact size above it.
 */
const FIELD_HEIGHT = "h-11 sm:h-9";

export function BookingForm({ t, locale, services, barbers, today, dates }: BookingFormProps) {
  const formId = useId();
  const slots = useMemo(() => slotTimes(), []);

  // Date and barber drive the availability lookup, so they become controlled.
  const [date, setDate] = useState(today);
  const [barber, setBarber] = useState("any");
  const [time, setTime] = useState(DEFAULT_TIME);
  const [busy, setBusy] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    void getBusySlots(date, barber).then((taken) => {
      if (cancelled) return;
      setBusy(taken);
      // If the time already chosen has just been taken, move to the first that
      // is still free rather than leaving an unselectable value in the field.
      setTime((current) =>
        taken.includes(current) ? (slots.find((s) => !taken.includes(s)) ?? current) : current,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [date, barber, slots]);

  const [state, action, pending] = useActionState<State, FormData>(
    async (_previous, formData) => submitBooking(formData),
    null,
  );

  useEffect(() => {
    if (state === null) return;

    if (state.ok) {
      toast.success(t.booking.successTitle, {
        description: fill(t.booking.successBody, { phone: state.phone }),
      });
      return;
    }

    const description =
      state.error === "rate_limited"
        ? t.booking.rateLimited
        : fill(t.booking.errorBody, { phone: shop.phoneDisplay });

    toast.error(t.booking.errorTitle, { description });
  }, [state, t]);

  const allTaken = slots.length > 0 && slots.every((slot) => busy.includes(slot));

  const fieldError = (name: string) =>
    state !== null && !state.ok && state.error === "validation" ? state.fields?.[name] : undefined;

  const message = (name: string) => {
    const issue = fieldError(name);
    if (!issue) return undefined;
    if (issue === "invalid_phone") return t.booking.invalidPhone;
    return t.booking.required;
  };

  if (state?.ok) {
    return (
      <div className="panel flex flex-col items-center gap-4 bg-card/95 px-6 py-16 text-center backdrop-blur-md">
        <span className="flex size-12 items-center justify-center rounded-full bg-brass/15 text-brass">
          <Check className="size-6" aria-hidden />
        </span>
        <h3 className="font-heading text-2xl text-cream">{t.booking.successTitle}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {fill(t.booking.successBody, { phone: state.phone })}
        </p>

        {state.appointment && (
          <div className="mt-4 flex flex-col items-center gap-3 border-t border-border/60 pt-6">
            <p className="label text-[0.62rem] text-brass">{t.booking.addToCalendar}</p>
            <AddToCalendar appointment={state.appointment} t={t} />
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      action={action}
      // Opaque over the photographic backdrop — the translucent `panel` default
      // leaves the labels competing with the picture behind them.
      className="panel flex flex-col gap-6 bg-card/95 p-6 backdrop-blur-md sm:p-8"
      noValidate
    >
      {/* Honeypot: off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${formId}-name`} label={t.booking.name} error={message("name")}>
          <Input
            id={`${formId}-name`}
            name="name"
            required
            autoComplete="name"
            className={FIELD_HEIGHT}
            placeholder={t.booking.namePlaceholder}
            aria-invalid={message("name") !== undefined}
          />
        </Field>

        <Field id={`${formId}-phone`} label={t.booking.phone} error={message("phone")}>
          <Input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            className={FIELD_HEIGHT}
            placeholder={t.booking.phonePlaceholder}
            aria-invalid={message("phone") !== undefined}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Native selects, not the shadcn Select: this form has to work the
            moment it paints, and a phone's own picker is faster to use. */}
        <Field id={`${formId}-service`} label={t.booking.service} error={message("service")}>
          <NativeSelect
            id={`${formId}-service`}
            name="service"
            required
            defaultValue=""
            className={FIELD_HEIGHT}
          >
            <option value="" disabled>
              {t.booking.servicePlaceholder}
            </option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {(locale === "vi" ? service.nameVi : service.nameEn) +
                  ` — ${formatVnd(service.price)}`}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field id={`${formId}-barber`} label={t.booking.barber}>
          <NativeSelect
            id={`${formId}-barber`}
            name="barber"
            value={barber}
            onChange={(e) => setBarber(e.target.value)}
            className={FIELD_HEIGHT}
          >
            {barbers.map((barber) => (
              <option key={barber.slug} value={barber.slug}>
                {locale === "vi" ? barber.nameVi : barber.nameEn}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* A list of days, not `<input type="date">`. See `bookableDates` —
            the native control renders no calendar indicator on iOS Safari, so
            it reads as a dead text box beside the fields that have one. */}
        <Field id={`${formId}-date`} label={t.booking.date} error={message("date")}>
          <NativeSelect
            id={`${formId}-date`}
            name="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={message("date") !== undefined}
            className={FIELD_HEIGHT}
          >
            {dates.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field
          id={`${formId}-time`}
          label={t.booking.time}
          error={message("time")}
          hint={allTaken ? t.booking.dayFull : undefined}
        >
          <NativeSelect
            id={`${formId}-time`}
            name="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={FIELD_HEIGHT}
          >
            {slots.map((slot) => {
              const taken = busy.includes(slot);
              return (
                <option key={slot} value={slot} disabled={taken}>
                  {taken ? `${slot} — ${t.booking.slotTaken}` : slot}
                </option>
              );
            })}
          </NativeSelect>
        </Field>
      </div>

      <Field id={`${formId}-note`} label={t.booking.note}>
        <Textarea
          id={`${formId}-note`}
          name="note"
          rows={3}
          maxLength={500}
          placeholder={t.booking.notePlaceholder}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? t.booking.submitting : t.booking.submit}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="label text-[0.62rem] text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-warning">{hint}</p>}
    </div>
  );
}

/**
 * A native select dressed to match `ui/input.tsx`.
 *
 * The metrics below — height, radius, fill, focus ring — are copied from the
 * Input component deliberately: the two sit side by side in this form, and a
 * select that is a different height and a different roundness reads as a bug.
 * If Input is ever restyled, this has to follow.
 *
 * `appearance-none` drops the platform arrow so it can be replaced with one in
 * brass; the extra right padding keeps the label clear of it.
 */
const SELECT_CHEVRON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23DFB45E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>";

function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ backgroundImage: `url("${SELECT_CHEVRON}")` }}
      className={cn(
        "h-9 w-full min-w-0 appearance-none rounded-4xl border border-input bg-input/30 py-1 pr-9 pl-3",
        "bg-[length:0.85rem] bg-[position:right_0.85rem_center] bg-no-repeat",
        "text-base transition-colors outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // The dropdown list is drawn by the OS, so its colours have to be set
        // on the options themselves rather than inherited from the field.
        "[&>option]:bg-card [&>option]:text-cream",
        "[&>option:disabled]:text-muted-foreground",
        className,
      )}
    />
  );
}
