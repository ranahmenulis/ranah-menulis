import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { MAX_POST_WORDS } from "../../post-model";

/**
 * Words of the public text against the 500 limit (COM-01). Past the limit only the number, the line
 * and the message turn red; the text is never cut and a draft can still be saved (DESIGN.md 7.1).
 */
export function WordCounter({
  words,
  compact = false,
  className,
}: {
  words: number;
  /** Phone footer: a number, a line, and "lebih N" instead of the full message. */
  compact?: boolean;
  className?: string;
}) {
  const over = words > MAX_POST_WORDS;
  const by = words - MAX_POST_WORDS;
  return (
    <div role="status" className={cn("grid gap-2", className)}>
      <p className="flex items-baseline gap-1.5 text-sm text-ink-muted">
        <b
          className={cn(
            "text-xl leading-6 font-semibold tabular-nums",
            over ? "text-danger" : "text-ink",
          )}
        >
          {words.toLocaleString("id-ID")}
        </b>
        <span>/ {MAX_POST_WORDS} kata</span>
        {over && compact && <span className="text-danger">· lebih {by}</span>}
      </p>
      <div aria-hidden className="h-1 bg-line">
        <div
          className={cn("h-full", over ? "bg-danger" : "bg-ink")}
          style={{ width: `${Math.min(100, (words / MAX_POST_WORDS) * 100)}%` }}
        />
      </div>
      {over && !compact && (
        <p className="flex items-start gap-1.5 text-sm text-danger">
          <WarningCircle size={20} aria-hidden className="shrink-0" />
          <span>
            Lebih {by} kata dari batas {MAX_POST_WORDS}. Kurangi teks atau bagian yang dipilih, atau
            simpan sebagai draf; tidak ada teks yang terhapus.
          </span>
        </p>
      )}
    </div>
  );
}
