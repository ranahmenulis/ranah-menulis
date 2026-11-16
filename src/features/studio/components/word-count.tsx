"use client";

import { useState } from "react";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { readingMinutes } from "@/lib/text-stats";
import type { EditorStats } from "../editor-stats";

type WordCountProps = {
  /** Words in the document, the same number the daily target counts. */
  words: number;
  /** Characters and paragraphs; `null` until the editor has opened the text. */
  stats: EditorStats | null;
  /** Counts for the selected text, or `null` while nothing is selected. */
  selection: EditorStats | null;
  className?: string;
};

const number = new Intl.NumberFormat("id-ID");
const NONE = "—";

/** Reading time reads "—" for no words: "1 mnt" would suggest there is something to read. */
const minutes = (words: number) => (words > 0 ? `${readingMinutes(words)} mnt` : NONE);

type Row = { label: string; document: string; selected?: string };

function rowsOf(words: number, stats: EditorStats | null, selection: EditorStats | null): Row[] {
  const count = (value: number | undefined) => (value === undefined ? NONE : number.format(value));
  const sel = (read: (s: EditorStats) => string) => (selection ? read(selection) : undefined);
  return [
    { label: "Kata", document: count(words), selected: sel((s) => count(s.words)) },
    {
      label: "Karakter",
      document: count(stats?.characters),
      selected: sel((s) => count(s.characters)),
    },
    {
      label: "Paragraf",
      document: count(stats?.paragraphs),
      selected: sel((s) => count(s.paragraphs)),
    },
    { label: "Waktu baca", document: minutes(words), selected: sel((s) => minutes(s.words)) },
  ];
}

/**
 * Word count in the editor bar (STD-04). It always shows the words in the document; with text
 * selected it reads "12 dari 167 kata". Opening it lists words, characters, paragraphs and reading
 * time, with a column for the selection when there is one. Characters and paragraphs are counted
 * live from the text and are not stored. [konfirmasi] Reading time (Q-52): 200 words a minute.
 */
export function WordCount({ words, stats, selection, className }: WordCountProps) {
  const [open, setOpen] = useState(false);
  const rows = rowsOf(words, stats, selection);
  const label = selection
    ? `${number.format(selection.words)} dari ${number.format(words)} kata`
    : `${number.format(words)} kata`;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Penghitung tulisan"
      className={cn("max-md:static", className)}
      panelClassName="w-72 p-4 text-sm max-md:inset-x-4 max-md:w-auto"
      renderTrigger={(props) => (
        <button
          {...props}
          type="button"
          title="Rincian penghitung"
          className="inline-flex min-h-8 cursor-pointer items-center text-xs whitespace-nowrap text-ink-muted tabular-nums hover:text-ink hover:underline hover:underline-offset-3 aria-expanded:text-ink aria-expanded:underline aria-expanded:underline-offset-3"
        >
          {label}
        </button>
      )}
    >
      <table className="w-full border-collapse tabular-nums">
        <caption className="pb-3 text-left font-medium">
          {selection ? "Teks yang dipilih" : "Isi tulisan"}
        </caption>
        {selection && (
          <thead>
            <tr className="text-xs text-ink-muted">
              <td />
              <th scope="col" className="py-1 text-right font-normal">
                Pilihan
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                Dokumen
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <th scope="row" className="py-2 text-left font-normal text-ink-muted">
                {row.label}
              </th>
              {row.selected !== undefined && <td className="py-2 text-right">{row.selected}</td>}
              <td className={cn("py-2 text-right", row.selected !== undefined && "text-ink-muted")}>
                {row.document}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Popover>
  );
}
