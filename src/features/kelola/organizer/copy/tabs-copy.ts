import type { Locale } from "@/lib/i18n/config";
import { kelolaOrganizerTabs as en } from "./tabs-en";
import { kelolaOrganizerTabs as id } from "./tabs-id";

/** The Organizer tab copy for pure modules that cannot call the client hook. */
export const tabsCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
