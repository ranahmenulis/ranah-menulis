import type { Locale } from "@/lib/i18n/config";
import { kelolaMentor as en } from "./en";
import { kelolaMentor as id } from "./id";

/** The Mentor dictionary for pure modules that cannot use the client hook. */
export const mentorCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);

/** "1 task" vs "2 tasks": Indonesian has one form, English has two. */
export const pluralOf = (one: string, other: string, count: number, locale: Locale = "id") =>
  locale === "en" && count === 1 ? one : other;
