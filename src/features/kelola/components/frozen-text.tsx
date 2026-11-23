"use client";

import { useT } from "@/lib/i18n/provider";
import { exportBlocks } from "@/features/studio/export/export-blocks";
import type { SubmissionVersion } from "@/features/projects/submission-types";

/**
 * The frozen text of one version, read-only. It goes through the same flattening as export, so only
 * plain text is ever rendered (no HTML from the document) and a node type it does not know is
 * skipped instead of breaking the screen. Bold and italic are not shown [usulan].
 */
export function FrozenText({ content }: { content: SubmissionVersion["content"] }) {
  const t = useT().kelolaShared;
  const blocks = exportBlocks(content);
  if (blocks.length === 0) return <p className="text-sm text-ink-muted">{t.frozen.empty}</p>;
  return (
    <div className="grid gap-4 read-body wrap-anywhere">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h3 key={i} className="font-serif text-xl font-semibold">
                {block.text}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l border-line pl-4 whitespace-pre-line italic">
                {block.text}
              </blockquote>
            );
          case "bullet":
            return (
              <p
                key={i}
                className="pl-5 whitespace-pre-line before:-ml-5 before:inline-block before:w-5 before:content-['•']"
              >
                {block.text}
              </p>
            );
          case "number":
            return (
              <p key={i} className="pl-6 whitespace-pre-line">
                <span className="-ml-6 inline-block w-6 text-ink-muted">{block.index}.</span>
                {block.text}
              </p>
            );
          default:
            return (
              <p key={i} className="whitespace-pre-line">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
