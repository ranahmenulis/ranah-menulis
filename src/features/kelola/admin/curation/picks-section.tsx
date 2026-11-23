"use client";

import { ArrowDown, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { authorOf } from "@/features/community/post-model";
import type { EditorPick } from "@/features/community/curation/picks-store";
import type { Post } from "@/features/community/types";
import type { AdminResult } from "../admin-actions";
import { addPick, movePick, removePick } from "./curation-actions";
import { candidates, pickRows } from "./curation-model";

type Report = (result: AdminResult, focus?: boolean) => void;

/** Editor's Picks (COM-09, BR-COM-05): an ordered list the team curates by hand. */
export function PicksSection({
  picks,
  posts,
  report,
}: {
  picks: readonly EditorPick[];
  posts: readonly Post[];
  report: Report;
}) {
  const t = useT().kelolaAdmin.curation.picks;
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => pickRows(picks, posts, locale), [picks, posts, locale]);
  const found = useMemo(() => candidates(posts, picks, query), [posts, picks, query]);

  return (
    <section aria-labelledby="picks-title" className="grid gap-4">
      <div className="grid gap-1">
        <h2 id="picks-title" className="heading-md">
          {t.title}
        </h2>
        <p className="text-sm text-ink-muted">{t.intro}</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.empty}</p>
      ) : (
        <ol className="grid">
          {rows.map((row, i) => (
            <li
              key={row.postId}
              className="flex min-w-0 items-center gap-2 border-b border-line py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium wrap-anywhere text-ink">{row.title}</p>
                <p className="text-xs text-ink-muted">{row.shown ? row.author : t.notShown}</p>
              </div>
              <IconButton
                label={format(t.up, { title: row.title })}
                disabled={i === 0}
                onClick={() => report(movePick(row.postId, -1))}
              >
                <ArrowUp size={20} aria-hidden />
              </IconButton>
              <IconButton
                label={format(t.down, { title: row.title })}
                disabled={i === rows.length - 1}
                onClick={() => report(movePick(row.postId, 1))}
              >
                <ArrowDown size={20} aria-hidden />
              </IconButton>
              <Button
                variant="text"
                size="sm"
                aria-label={format(t.removeAria, { title: row.title })}
                onClick={() => report(removePick(row.postId), true)}
              >
                {t.remove}
              </Button>
            </li>
          ))}
        </ol>
      )}

      <Field id="cari-pilihan" label={t.addLabel}>
        <Input
          id="cari-pilihan"
          type="search"
          value={query}
          placeholder={t.addPlaceholder}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Field>
      {found.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.noMatch}</p>
      ) : (
        <ul className="grid">
          {found.map((post) => (
            <li key={post.id} className="flex min-w-0 items-center gap-3 border-b border-line py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium wrap-anywhere text-ink">{post.title}</p>
                <p className="text-xs text-ink-muted">{authorOf(post.authorId).name}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                aria-label={format(t.addAria, { title: post.title })}
                onClick={() => report(addPick(post.id, posts), true)}
              >
                {t.add}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
