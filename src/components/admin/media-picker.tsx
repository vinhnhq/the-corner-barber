"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Film, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The little the picker needs to know about an item — not the full row. */
export type PickerItem = {
  id: string;
  still: string;
  blur: string;
  alt: string;
  kind: "image" | "video";
};

type Common = {
  items: PickerItem[];
  /** Dialog title, e.g. the place being filled. */
  title: string;
  /** Bound server action; receives a FormData built here. */
  action: (formData: FormData) => Promise<void>;
  /** Extra fields every submission carries (slot, barber slug…). */
  fields?: Record<string, string>;
  className?: string;
};

type Single = Common & {
  mode: "single";
  /** Currently assigned id, or null. */
  value: string | null;
  /** The field name the chosen id is sent under. */
  name: string;
  /** Sends an empty value to clear the place. Omit to disallow. */
  clearLabel?: string;
};

type Multi = Common & {
  mode: "multi";
  /** Ids currently selected. Each tap toggles one by submitting `{ id, visible }`. */
  selected: string[];
};

type MediaPickerProps = Single | Multi;

/**
 * Pick from the library without leaving the page. A full-screen sheet on a
 * phone, a centred one on a desktop; native `<dialog>` for the focus trap and
 * Escape. `single` fills one place and closes; `multi` toggles membership —
 * the gallery — and stays open so several can be chosen in a row.
 */
export function MediaPicker(props: MediaPickerProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function submit(values: Record<string, string>, closeAfter: boolean) {
    const formData = new FormData();
    for (const [key, value] of Object.entries({ ...props.fields, ...values })) {
      formData.set(key, value);
    }
    startTransition(async () => {
      await props.action(formData);
      router.refresh();
      setBusyId(null);
      if (closeAfter) setOpen(false);
    });
  }

  function choose(item: PickerItem) {
    setBusyId(item.id);
    if (props.mode === "single") {
      submit({ [props.name]: item.id }, true);
    } else {
      const on = props.selected.includes(item.id);
      submit({ id: item.id, visible: on ? "false" : "true" }, false);
    }
  }

  const isOn = (id: string) =>
    props.mode === "single" ? props.value === id : props.selected.includes(id);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className={props.className}
      >
        {props.mode === "single" ? "Chọn ảnh" : "Thêm / bớt ảnh"}
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={props.title}
        className="m-0 h-full max-h-none w-full max-w-none bg-background text-foreground backdrop:bg-background/80 sm:m-auto sm:h-auto sm:max-h-[85vh] sm:w-[min(64rem,92vw)] sm:border sm:border-border"
      >
        <div className="flex h-full flex-col sm:h-auto sm:max-h-[85vh]">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="tag text-brass">{props.mode === "single" ? "Chọn cho" : "Đang hiện"}</p>
              <p className="mt-1 font-serif text-xl text-cream">{props.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {props.mode === "single" && props.clearLabel && props.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => submit({ [props.name]: "" }, true)}
                >
                  {props.clearLabel}
                </Button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="flex size-11 items-center justify-center text-cream transition-colors hover:text-brass"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Rendered only while open: a page has a dozen pickers over the same
              library, and a dozen hidden grids of seventy tiles is a heavy DOM. */}
          {open && (
            <ul className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-4 lg:grid-cols-6">
              {props.items.map((item) => {
                const on = isOn(item.id);
                const busy = busyId === item.id && pending;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => choose(item)}
                      disabled={pending}
                      aria-pressed={on}
                      aria-label={item.alt || item.id}
                      className={cn(
                        "group relative block aspect-square w-full overflow-hidden border bg-card transition-colors",
                        on ? "border-brass" : "border-border hover:border-dim",
                      )}
                    >
                      <Image
                        src={item.still}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 30vw"
                        placeholder="blur"
                        blurDataURL={item.blur}
                        className={cn("object-cover", on && "opacity-80")}
                      />
                      {item.kind === "video" && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-background/80 p-1">
                          <Film className="size-3 text-cream" aria-hidden />
                        </span>
                      )}
                      {(on || busy) && (
                        <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-brass text-primary-foreground">
                          {busy ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Check className="size-3.5" aria-hidden />
                          )}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {open && props.items.length === 0 && (
            <p className="px-5 pb-8 text-center text-sm text-muted-foreground">
              Thư viện trống — tải ảnh lên ở mục Thư viện trước.
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
