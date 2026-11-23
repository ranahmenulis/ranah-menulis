import type { Locale } from "@/lib/i18n/config";
import { COMMUNITY_LINK_LIMIT, isHttpsLink } from "@/lib/platform-settings";
import { adminCopy, adminMessage, type AdminCode } from "../copy/admin-copy";

export type LinkProblem = "kosong" | "bukan-https" | "terlalu-panjang";

/** The result code (and params) each problem is reported with. */
export const LINK_CODES: Record<LinkProblem, [AdminCode, Record<string, string>?]> = {
  kosong: ["linkEmpty"],
  "bukan-https": ["linkNotHttps"],
  "terlalu-panjang": ["linkTooLong", { limit: String(COMMUNITY_LINK_LIMIT) }],
};

/** The sentence for a problem in the interface language. */
export function linkProblemText(problem: LinkProblem, locale: Locale = "id"): string {
  const [code, params] = LINK_CODES[problem];
  return adminMessage({ message: adminCopy("id").results[code], code, params }, locale);
}

/** Indonesian sentences; screens use `linkProblemText` with the interface language. */
export const linkMessage: Record<LinkProblem, string> = {
  kosong: linkProblemText("kosong"),
  "bukan-https": linkProblemText("bukan-https"),
  "terlalu-panjang": linkProblemText("terlalu-panjang"),
};

/** One problem per input; null when the address can be saved. */
export function validateCommunityLink(text: string): LinkProblem | null {
  const t = text.trim();
  if (t === "") return "kosong";
  if (t.length > COMMUNITY_LINK_LIMIT) return "terlalu-panjang";
  return isHttpsLink(t) ? null : "bukan-https";
}
