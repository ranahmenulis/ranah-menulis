import type { Locale } from "@/lib/i18n/config";
import { projectsContest as en } from "./contest-en";
import { projectsContest as id } from "./contest-id";

/** The contest copy for pure modules that cannot call the client hook. */
export const contestCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
