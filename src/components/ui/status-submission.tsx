import { Check, Hourglass, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

export type SubmissionStatus =
  | "draf"
  | "terkirim"
  | "peninjauan"
  | "perlu-revisi"
  | "revisi-terkirim"
  | "diterima"
  | "ditolak"
  | "ditarik";

const label: Record<SubmissionStatus, string> = {
  draf: "Draf",
  terkirim: "Terkirim",
  peninjauan: "Dalam Peninjauan",
  "perlu-revisi": "Perlu Revisi",
  "revisi-terkirim": "Revisi Terkirim",
  diterima: "Diterima",
  ditolak: "Ditolak",
  ditarik: "Ditarik",
};

const pill =
  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs whitespace-nowrap";

type Props = {
  status: SubmissionStatus;
  /**
   * Di layar yang sudah punya tombol primer (Beranda) "Perlu Revisi" memakai garis, bukan isian,
   * supaya hanya ada satu isian tinta [usulan]. Di Proyek saya dan detail submission tetap terisi.
   */
  outlineRevisi?: boolean;
  /** Tampilan Organizer/Editor: status yang menunggu tindakan mereka yang terisi. */
  filled?: boolean;
  className?: string;
};

/** Monokrom: makin berisi, makin butuh tindakanmu. Label teks selalu ada. Ditolak bukan merah. */
export function StatusSubmission({ status, outlineRevisi, filled, className }: Props) {
  const text = label[status];

  if (status === "ditarik") {
    return <span className={cn("text-xs text-ink-muted", className)}>{text}</span>;
  }

  const tone: Record<Exclude<SubmissionStatus, "ditarik">, string> = {
    draf: "border-dashed border-ink-faint text-ink-muted",
    terkirim: "border-line text-ink",
    peninjauan: "border-line text-ink",
    "perlu-revisi": outlineRevisi
      ? "border-line-strong text-ink font-medium"
      : "border-ink bg-ink text-on-ink font-medium",
    "revisi-terkirim": "border-line text-ink",
    diterima: "border-line-strong text-ink font-medium",
    ditolak: "border-line text-ink-muted",
  };

  return (
    <span
      className={cn(
        pill,
        tone[status],
        filled && "border-ink bg-ink text-on-ink font-medium",
        className,
      )}
    >
      {status === "peninjauan" && <Hourglass size={14} aria-hidden />}
      {status === "diterima" && <Check size={14} aria-hidden />}
      {status === "ditolak" && <X size={14} aria-hidden />}
      {text}
    </span>
  );
}
