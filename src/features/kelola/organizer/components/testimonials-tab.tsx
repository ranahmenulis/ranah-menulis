"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatProjectDate } from "@/features/projects/project-model";
import {
  isHidden,
  latestDecision,
  publicName,
  type Testimonial,
} from "@/features/projects/kelas/testimonial-model";
import { useAllTestimonials } from "@/features/projects/kelas/testimonial-store";
import type { Project } from "@/features/projects/types";
import { ReasonDialog } from "../../components/reason-dialog";
import { decideTestimonial, decisionText } from "../testimonial-actions";
import { listCardClass } from "../../components/list-card";

type Asking = { testimonial: Testimonial; hide: boolean };

/**
 * Testimonials of a class (KLS-07): they go live as soon as a participant writes them, and the
 * Organizer or an Administrator hides one that should not be there, with a reason, or brings it
 * back. The result is said beside the list, because the button changes once it is done.
 */
export function TestimonialsTab({ project }: { project: Project }) {
  const t = useT().kelolaOrganizerTabs.testimonials;
  const anonymous = useT().projectsClass.testimonial.anonymous;
  const locale = useLocale();
  const { items, decisions } = useAllTestimonials();
  const list = items
    .filter((item) => item.slug === project.slug)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const [asking, setAsking] = useState<Asking | null>(null);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);

  function confirm(reason: string) {
    if (!asking) return;
    const result = decideTestimonial(
      project.slug,
      asking.testimonial.id,
      asking.hide ? "sembunyikan" : "pulihkan",
      reason,
    );
    setAsking(null);
    setSaid(decisionText(result.code, locale));
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="testimoni-title" className="grid max-w-170 gap-4">
      <h2 id="testimoni-title" className="heading-md">
        {t.title}
      </h2>
      <p className="text-sm text-ink-muted">{t.intro}</p>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {list.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className={listCardClass}>
          {list.map((item) => {
            const hidden = isHidden(item.id, decisions);
            const last = latestDecision(item.id, decisions);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3"
              >
                <div className="grid min-w-0 gap-1">
                  <p className="text-base wrap-anywhere whitespace-pre-line">{item.text}</p>
                  <p className="text-xs text-ink-muted">
                    {format(t.meta, {
                      name: item.name,
                      shown: publicName(item, anonymous),
                      date: formatProjectDate(item.updatedAt, project.timeZone, locale),
                    })}
                    {item.sample ? t.sample : ""}
                  </p>
                  <p className="text-xs font-medium">{hidden ? t.hidden : t.shown}</p>
                  {hidden && last?.reason && (
                    <p className="text-xs wrap-anywhere text-ink-muted">
                      {format(t.reason, { reason: last.reason })}
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAsking({ testimonial: item, hide: !hidden })}
                >
                  {hidden ? t.restore : t.hide}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {asking && (
        <ReasonDialog
          title={asking.hide ? t.hideTitle : t.restoreTitle}
          hint={asking.hide ? t.hideHint : t.restoreHint}
          required={asking.hide}
          emptyMessage={t.emptyReason}
          confirmLabel={asking.hide ? t.hide : t.restore}
          busy={false}
          onConfirm={confirm}
          onClose={() => setAsking(null)}
        />
      )}
    </section>
  );
}
