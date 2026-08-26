import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
} from "./dictionaries";

/**
 * Reads the visitor's locale from the cookie the switcher sets. Reading cookies
 * opts the page into dynamic rendering, which is what we want — the same URL
 * must be able to serve either language.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getTranslations(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
