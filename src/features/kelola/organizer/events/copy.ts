import type { Locale } from "@/lib/i18n/config";
import { kelolaOrganizerEvents as en } from "./copy-en";
import { kelolaOrganizerEvents as id } from "./copy-id";

/** The Organizer event copy for pure modules that cannot call the client hook. */
export const eventsCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
