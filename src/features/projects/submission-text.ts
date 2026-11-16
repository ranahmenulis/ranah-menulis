import { formatNumber } from "./project-model";
import type { SubmitBlock } from "./submission-model";
import type { SubmissionRules } from "./types";

/** "800 sampai 2.000 kata", or "maksimal 150 kata" when there is no real minimum. */
export function wordRuleText(rules: SubmissionRules): string {
  return rules.minWords <= 1
    ? `maksimal ${formatNumber(rules.maxWords)} kata`
    : `${formatNumber(rules.minWords)} sampai ${formatNumber(rules.maxWords)} kata`;
}

export const worksText = (n: number) => `${formatNumber(n)} karya`;

/** One sentence for the screen that replaces the form. */
export function blockMessage(block: SubmitBlock, rules: SubmissionRules | null): string {
  switch (block) {
    case "tidak-menerima":
      return "Proyek ini tidak menerima karya sebagai kiriman. Tugas kelas dikumpulkan di halaman tugas, yang menyusul.";
    case "tamu":
      return "Masuk untuk mengirim karya ke proyek ini.";
    case "belum-terdaftar":
      return "Kamu belum terdaftar di proyek ini. Daftar dulu untuk mengirim karya.";
    case "menunggu-pembayaran":
      return "Pendaftaranmu masih menunggu pembayaran. Karya bisa dikirim setelah pendaftaran aktif.";
    case "ditutup":
      return "Pengiriman karya ke proyek ini sudah ditutup.";
    case "batas-tercapai":
      return `Kamu sudah mengirim ${worksText(rules?.maxWorks ?? 0)}, batas untuk proyek ini.`;
  }
}

const TIME = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "25 Nov 2026 14.05" in the reader's own zone: this is when *they* sent it. */
export const sentAtText = (timestamp: number) => TIME.format(timestamp);
