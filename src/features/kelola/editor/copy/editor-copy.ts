import type { Locale } from "@/lib/i18n/config";
import { kelolaEditor as en } from "./en";
import { kelolaEditor as id } from "./id";

/** The Editor copy for pure modules that cannot call the client hook. */
export const editorCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);

/** The Indonesian copy, the source of the constants kept for callers that read Indonesian. */
export const editorId = id;
