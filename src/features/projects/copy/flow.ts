import type { Locale } from "@/lib/i18n/config";
import { projectsFlow as en } from "./flow-en";
import { projectsFlow as id } from "./flow-id";

/** The participant-flow copy for pure modules that cannot use the client provider. */
export const flowCopy = (locale: Locale = "id") => (locale === "en" ? en : id);
