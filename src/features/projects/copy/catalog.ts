import type { Locale } from "@/lib/i18n/config";
import { projectsCatalog as en } from "./catalog-en";
import { projectsCatalog as id } from "./catalog-id";

/** The catalog copy for pure modules that cannot use the client provider. */
export const catalogCopy = (locale: Locale = "id") => (locale === "en" ? en : id);
