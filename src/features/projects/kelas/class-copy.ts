import type { Locale } from "@/lib/i18n/config";
import { projectsClass as en } from "../copy/class-en";
import { projectsClass as id } from "../copy/class-id";

/** The class dictionary for pure modules that cannot use the client hook. */
export const classCopy = (locale: Locale = "id") => (locale === "en" ? en : id);
