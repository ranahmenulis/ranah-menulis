import type { Locale } from "@/lib/i18n/config";
import { projectsSolo as en } from "./solo-en";
import { projectsSolo as id } from "./solo-id";

/** The Solo copy for pure modules that cannot call the client hook. */
export const soloCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
