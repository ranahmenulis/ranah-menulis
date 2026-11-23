import type { Locale } from "@/lib/i18n/config";
import { kelolaAudit as en } from "./en";
import { kelolaAudit as id } from "./id";

/** The audit copy for pure modules that cannot call the client hook. */
export const auditCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);
