import { COMMUNITY_LINK_LIMIT, isHttpsLink } from "@/lib/platform-settings";

export type LinkProblem = "kosong" | "bukan-https" | "terlalu-panjang";

export const linkMessage: Record<LinkProblem, string> = {
  kosong: "Tulis alamat tautan komunitas.",
  "bukan-https": "Alamat harus lengkap dan diawali https://, misalnya https://discord.gg/…",
  "terlalu-panjang": `Alamat paling banyak ${COMMUNITY_LINK_LIMIT} karakter.`,
};

/** One problem per input; null when the address can be saved. */
export function validateCommunityLink(text: string): LinkProblem | null {
  const t = text.trim();
  if (t === "") return "kosong";
  if (t.length > COMMUNITY_LINK_LIMIT) return "terlalu-panjang";
  return isHttpsLink(t) ? null : "bukan-https";
}
