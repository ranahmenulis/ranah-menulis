/**
 * Results of event actions carry a code. `message` is the Indonesian default for the same code;
 * screens translate by `code` with `eventMessage`. `{status}` is filled from `state`.
 */
export const EVENT_MESSAGES = {
  inactive: "Akun aktif diperlukan untuk mengikuti event.",
  unavailable: "Event ini tidak tersedia.",
  missingDocument: "Dokumen itu tidak bisa dipakai. Pilih dokumen Studio yang tersedia.",
  storageError: "Perubahan belum tersimpan di perangkat ini. Coba lagi.",
  alreadyJoined: "Kamu sudah terdaftar di event ini.",
  registrationClosed: "Pendaftaran tidak tersedia. {status}.",
  archived: "Dokumen ini ada di Arsip. Pulihkan dulu untuk memakainya.",
  entryChanged: "Pendaftaran sudah berubah. Periksa status event dan coba lagi.",
  noSprint: "Sesi sprint tidak tersedia.",
  sprintNotRunning: "Sesi sprint sedang tidak berlangsung.",
  sprintAlready: "Sesi sprint sudah diikuti.",
  joined: "Kamu bergabung dengan event.",
  left: "Kamu keluar dari event.",
  sprintJoined: "Kamu bergabung dengan sprint.",
} as const;

export type EventCode = keyof typeof EVENT_MESSAGES;

export type EventResult = {
  ok: boolean;
  code: EventCode;
  message: string;
  /** Set with `registrationClosed`: which state the event is in. */
  state?: "upcoming" | "open" | "full" | "finished";
};

/** Text of a result from a dictionary of the same shape; `status` maps a state to its label. */
export function eventMessage(
  result: Pick<EventResult, "code" | "state">,
  messages: Record<EventCode, string> = EVENT_MESSAGES,
  status?: Record<"upcoming" | "open" | "full" | "finished", string>,
): string {
  const text = messages[result.code];
  return result.state && status ? text.replace("{status}", status[result.state]) : text;
}
