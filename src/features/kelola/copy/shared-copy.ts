import type { Locale } from "@/lib/i18n/config";
import { kelolaShared as en } from "./shared-en";
import { kelolaShared as id } from "./shared-id";

/** The shared Kelola copy for pure modules that cannot call the client hook. */
export const sharedCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);

/** The Indonesian copy, the source of the constants kept for callers that read Indonesian. */
export const sharedId = id;
