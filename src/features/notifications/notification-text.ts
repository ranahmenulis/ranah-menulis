import type { Locale } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/provider";
import { formatAgo } from "@/features/community/format-time";
import { authorOf } from "@/features/community/post-model";
import { notifications as copyId } from "./copy/id";
import { ageOf } from "./notification-model";
import type { Notification } from "./types";

type Copy = typeof copyId;

/**
 * The bold start of a line: "Hafiz Rahman dan 11 orang lain"; null for events without an actor.
 * Copy defaults to Indonesian so pure callers and tests stay simple.
 */
export function leadOf(
  n: Notification,
  copy: Pick<Copy, "andOthers" | "andOneOther"> = copyId,
): string | null {
  if (!n.actorId) return null;
  const name = authorOf(n.actorId).name;
  if (n.others === 0) return name;
  return format(n.others === 1 ? copy.andOneOther : copy.andOthers, {
    name,
    count: String(n.others),
  });
}

/**
 * Producers cannot know the reader's language, so values that differ per language (dates, stage
 * names) come twice: `due` for Indonesian and `dueEn` for English. English readers get the `En` one.
 */
function paramsFor(params: Record<string, string>, locale: Locale): Record<string, string> {
  if (locale !== "en") return params;
  const out = { ...params };
  for (const key of Object.keys(params)) {
    if (key.endsWith("En")) out[key.slice(0, -2)] = params[key];
  }
  return out;
}

/** The sentence after the actor: from the dictionary when the producer gave a key, else its own text. */
export function textOf(
  n: Notification,
  messages: Copy["messages"] = copyId.messages,
  locale: Locale = "id",
): string {
  if (n.message) {
    const template = (messages as Record<string, string>)[n.message.key];
    if (template) return format(template, paramsFor(n.message.params ?? {}, locale));
  }
  return n.text ?? "";
}

const AGO_UNIT: Record<Locale, { pattern: RegExp; suffix: string }> = {
  id: { pattern: /^\d+ (menit|jam|hari)$/, suffix: "lalu" },
  en: { pattern: /^\d+ (min|hr|days)$/, suffix: "ago" },
};

/** "25 menit lalu", "2 jam lalu", "kemarin", "12 Nov" (en: "25 min ago", "yesterday", "Nov 12"). */
export function agoLabel(n: Notification, now: number, locale: Locale = "id"): string {
  const label = formatAgo(now - ageOf(n, now), now, locale);
  const unit = AGO_UNIT[locale];
  return unit.pattern.test(label) ? `${label} ${unit.suffix}` : label;
}
