import { formatNumber, formatProjectDate } from "../../project-model";
import type { TimeZoneName } from "../../types";
import type { PreviewFile } from "../types";

const KIND: Record<PreviewFile["kind"], string> = { cover: "Sampul", layout: "Isi buku" };

const sizeText = (kb: number) =>
  kb >= 1000 ? `${formatNumber(Math.round(kb / 100) / 10)} MB` : `${kb} KB`;

/**
 * Preview files of the cover and the layout. They are descriptions only [usulan]: nothing can be
 * downloaded until files can be stored (Organizer panel, 6g), and the card says so.
 */
export function PreviewFiles({ files, zone }: { files: PreviewFile[]; zone: TimeZoneName }) {
  return (
    <section aria-labelledby="solo-berkas" className="grid gap-3">
      <h2 id="solo-berkas" className="heading-sm">
        Berkas pratinjau
      </h2>
      {files.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Belum ada berkas. Pratinjau sampul dan isi buku muncul di sini saat tim menyiapkannya.
        </p>
      ) : (
        <>
          <ul className="grid">
            {[...files].reverse().map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-3"
              >
                <p className="text-base font-medium wrap-anywhere">
                  {KIND[file.kind]} · versi {file.version}
                </p>
                <p className="text-xs text-ink-muted">
                  {sizeText(file.sizeKb)} · {formatProjectDate(file.at, zone)}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-muted">
            Contoh: berkas belum bisa diunduh sampai penyimpanan berkas tersedia.
          </p>
        </>
      )}
    </section>
  );
}
