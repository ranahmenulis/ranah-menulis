"use client";

import { DownloadFileButton } from "@/components/ui/download-file-button";
import { fileKindLabel } from "@/lib/files/format-size";
import type { FileStore } from "@/lib/files/file-store";
import { useStoredFileUrl } from "@/lib/files/use-stored-file-url";
import { formatNumber } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/config";
import { formatProjectDate } from "../../project-model";
import type { TimeZoneName } from "../../types";
import type { PreviewFile } from "../types";

const sizeText = (kb: number, locale: Locale) =>
  kb >= 1000 ? `${formatNumber(Math.round(kb / 100) / 10, locale)} MB` : `${kb} KB`;

/** The picture itself, read from the file store only when the attached file is an image. */
function ImageThumb({ file, store }: { file: PreviewFile; store?: FileStore }) {
  const c = useT().projectsSolo.previews;
  const stored = useStoredFileUrl(file.fileId ?? "", store);
  if (stored.status !== "ready") return null;
  return (
    // An object URL made on this device; there is nothing for next/image to optimise.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={stored.url}
      alt={format(c.imageAlt, { kind: c.kind[file.kind], n: String(file.version) })}
      className="max-h-80 w-full max-w-md bg-subtle object-contain"
    />
  );
}

function Thumbnail({ file, store }: { file: PreviewFile; store?: FileStore }) {
  if (!file.fileId || !file.fileType?.startsWith("image/")) return null;
  return <ImageThumb file={file} store={store} />;
}

function Row({ file, zone, store }: { file: PreviewFile; zone: TimeZoneName; store?: FileStore }) {
  const c = useT().projectsSolo.previews;
  const locale = useLocale();
  const meta = [
    file.fileType ? fileKindLabel(file.fileType, locale) : null,
    sizeText(file.sizeKb, locale),
    formatProjectDate(file.at, zone, locale),
  ].filter(Boolean);
  return (
    <li className="grid gap-3 border-b border-line py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="text-base font-medium wrap-anywhere">
          {format(c.versionLine, { kind: c.kind[file.kind], n: String(file.version) })}
        </p>
        <p className="text-xs text-ink-muted">{meta.join(" · ")}</p>
      </div>
      <Thumbnail file={file} store={store} />
      {file.fileId && (
        <div>
          <DownloadFileButton
            fileId={file.fileId}
            name={file.fileName ?? `${c.kind[file.kind]}-v${file.version}`}
            store={store}
          />
        </div>
      )}
    </li>
  );
}

/**
 * Preview files of the cover and the layout, attached by the publishing team (an image or a PDF).
 * A row from before files could be attached is only a description and says so.
 */
export function PreviewFiles({
  files,
  zone,
  store,
}: {
  files: PreviewFile[];
  zone: TimeZoneName;
  store?: FileStore;
}) {
  const c = useT().projectsSolo.previews;
  return (
    <section
      aria-labelledby="solo-berkas"
      className="grid gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6"
    >
      <h2 id="solo-berkas" className="heading-sm">
        {c.title}
      </h2>
      {files.length === 0 ? (
        <p className="text-sm text-ink-muted">{c.empty}</p>
      ) : (
        <>
          <ul className="grid">
            {[...files].reverse().map((file) => (
              <Row key={file.id} file={file} zone={zone} store={store} />
            ))}
          </ul>
          {files.some((file) => !file.fileId) && (
            <p className="text-xs text-ink-muted">{c.sampleNote}</p>
          )}
        </>
      )}
    </section>
  );
}
