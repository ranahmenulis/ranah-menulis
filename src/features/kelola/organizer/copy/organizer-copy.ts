import type { Locale } from "@/lib/i18n/config";
import { kelolaOrganizer as en } from "./en";
import { kelolaOrganizer as id } from "./id";

/** The Organizer copy for pure modules that cannot call the client hook. */
export const organizerCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
