import type { Locale } from "@/lib/i18n/config";
import { mentorCopy } from "./copy/mentor-copy";
import type { ClassAccess } from "./mentor-access";

export const blockedClassMessage: Record<Exclude<ClassAccess, "ok">, string> = mentorCopy(
  "id",
).blocked;

export const blockedClassMessageOf = (
  reason: Exclude<ClassAccess, "ok">,
  locale: Locale = "id",
): string => mentorCopy(locale).blocked[reason];
