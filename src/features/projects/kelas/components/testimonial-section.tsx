"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { ME_ID } from "@/features/community/fixtures/authors";
import { Section } from "../../components/category-blocks";
import type { AssignmentRow } from "../class-model";
import type { AssignmentStore } from "../storage/assignment-store";
import { deleteTestimonial } from "../testimonial-actions";
import { isHidden, publicName, testimonialCodeText, writeBlock } from "../testimonial-model";
import { useAllTestimonials } from "../testimonial-store";
import { TestimonialForm } from "./testimonial-form";

/**
 * The reader's own testimonial on the class dashboard (KLS-07): write one once a task of theirs is
 * marked Selesai, change it, or delete it. The result is said in a status line that takes focus,
 * because the form or the buttons are gone afterwards.
 */
export function TestimonialSection({
  slug,
  rows,
  started,
  store,
}: {
  slug: string;
  rows: AssignmentRow[];
  started: boolean;
  store?: AssignmentStore;
}) {
  const t = useT().projectsClass.testimonial;
  const locale = useLocale();
  const { items, decisions } = useAllTestimonials();
  const mine = items.find((t) => t.slug === slug && t.authorId === ME_ID && !t.sample);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const block = writeBlock(started, rows);

  const say = (message: string) => {
    setSaid(message);
    requestAnimationFrame(() => line.current?.focus());
  };

  function remove() {
    const result = deleteTestimonial(slug);
    setDeleting(false);
    setEditing(false);
    say(testimonialCodeText(result.code, locale));
  }

  return (
    <Section title={t.sectionTitle}>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {mine && !editing ? (
        <div className="grid gap-2 border-b border-line pb-3">
          <p className="text-base wrap-anywhere whitespace-pre-line">{mine.text}</p>
          <p className="text-xs text-ink-muted">
            {isHidden(mine.id, decisions)
              ? t.mine.hidden
              : fill(t.mine.shown, { name: publicName(mine, t.anonymous) })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              {t.mine.edit}
            </Button>
            <Button variant="danger-text" size="sm" onClick={() => setDeleting(true)}>
              {t.mine.delete}
            </Button>
          </div>
        </div>
      ) : mine || block === null ? (
        <TestimonialForm
          slug={slug}
          initial={mine}
          store={store}
          onCancel={mine ? () => setEditing(false) : undefined}
          onDone={(message) => {
            setEditing(false);
            say(message);
          }}
        />
      ) : (
        <Notice>{t.writeBlock[block]}</Notice>
      )}
      {deleting && (
        <Dialog
          open
          onClose={() => setDeleting(false)}
          title={t.mine.dialogTitle}
          description={t.mine.dialogBody}
          actions={
            <>
              <Button variant="secondary" onClick={() => setDeleting(false)}>
                {t.mine.cancel}
              </Button>
              <Button variant="danger" onClick={remove}>
                {t.mine.delete}
              </Button>
            </>
          }
        />
      )}
    </Section>
  );
}
