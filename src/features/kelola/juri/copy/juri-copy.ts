import type { Locale } from "@/lib/i18n/config";
import { kelolaJuri as en } from "./en";
import { kelolaJuri as id } from "./id";

/** The Judge copy for pure modules that cannot call the client hook. */
export const juriCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
