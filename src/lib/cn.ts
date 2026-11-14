type ClassValue = string | false | null | undefined;

/** Gabungkan nama kelas, abaikan nilai kosong. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
