import type { Locale } from "@/lib/i18n/config";
import { fill } from "@/features/studio/copy/fill";
import { kelolaAdmin as en } from "./en";
import { kelolaAdmin as id } from "./id";
import { kelolaModeration as moderationEn } from "./moderation-en";
import { kelolaModeration as moderationId } from "./moderation-id";

/** The Admin copy for pure modules that cannot call the client hook. */
export const adminCopy = (locale: Locale = "id"): typeof id => (locale === "en" ? en : id);

/** The moderation copy for pure modules that cannot call the client hook. */
export const moderationCopy = (locale: Locale = "id"): typeof moderationId =>
  locale === "en" ? moderationEn : moderationId;

export type AdminCode = keyof typeof id.results;

/** What an action hands back: the Indonesian `message` plus a stable `code` screens translate. */
export type CodedResult = {
  message: string;
  code?: AdminCode;
  params?: Record<string, string>;
};

/**
 * The text of a result in the interface language. Params named `role` and `decision` carry the
 * stored ids and are translated here; a result without a code keeps its own message.
 */
export function adminMessage(result: CodedResult, locale: Locale = "id"): string {
  if (!result.code) return result.message;
  const values: Record<string, string> = { ...result.params };
  const roles: Record<string, string> = adminCopy(locale).roles;
  const decisions: Record<string, string> = moderationCopy(locale).decisions;
  if (values.role !== undefined) values.role = roles[values.role] ?? values.role;
  if (values.decision !== undefined) {
    values.decision = decisions[values.decision] ?? values.decision;
  }
  return fill(adminCopy(locale).results[result.code], values);
}

/** A result body with its Indonesian message built from the code, for actions to return. */
export function coded(code: AdminCode, params?: Record<string, string>): Required<CodedResult> {
  const result = { message: "", code, params: params ?? {} };
  return { ...result, message: adminMessage(result, "id") };
}
