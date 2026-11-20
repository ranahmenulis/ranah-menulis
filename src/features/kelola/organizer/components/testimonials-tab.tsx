"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
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
import { decideTestimonial } from "../testimonial-actions";

type Asking = { testimonial: Testimonial; hide: boolean };

/**
 * Testimonials of a class (KLS-07): they go live as soon as a participant writes them, and the
 * Organizer or an Administrator hides one that should not be there, with a reason, or brings it
 * back. The result is said beside the list, because the button changes once it is done.
 */
export function TestimonialsTab({ project }: { project: Project }) {
  const { items, decisions } = useAllTestimonials();
  const list = items
    .filter((t) => t.slug === project.slug)
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
    setSaid(result.message);
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="testimoni-title" className="grid max-w-170 gap-4">
      <h2 id="testimoni-title" className="heading-md">
        Testimoni
      </h2>
      <p className="text-sm text-ink-muted">
        Testimoni langsung tampil di halaman kelas. Sembunyikan yang tidak pantas; penulisnya tetap
        melihatnya, tanpa alasan yang kamu tulis.
      </p>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {list.length === 0 ? (
        <EmptyState>Belum ada testimoni untuk kelas ini.</EmptyState>
      ) : (
        <ul className="border-t border-line">
          {list.map((t) => {
            const hidden = isHidden(t.id, decisions);
            const last = latestDecision(t.id, decisions);
            return (
              <li
                key={t.id}
                className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3"
              >
                <div className="grid min-w-0 gap-1">
                  <p className="text-base wrap-anywhere whitespace-pre-line">{t.text}</p>
                  <p className="text-xs text-ink-muted">
                    {t.name} · tampil sebagai {publicName(t)} ·{" "}
                    {formatProjectDate(t.updatedAt, project.timeZone)}
                    {t.sample ? " · contoh" : ""}
                  </p>
                  <p className="text-xs font-medium">
                    {hidden ? "Disembunyikan" : "Tampil di halaman kelas"}
                  </p>
                  {hidden && last?.reason && (
                    <p className="text-xs wrap-anywhere text-ink-muted">Alasan: {last.reason}</p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAsking({ testimonial: t, hide: !hidden })}
                >
                  {hidden ? "Pulihkan" : "Sembunyikan"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {asking && (
        <ReasonDialog
          title={asking.hide ? "Sembunyikan testimoni ini?" : "Tampilkan testimoni ini lagi?"}
          hint={
            asking.hide
              ? "Testimoni hilang dari halaman kelas. Alasannya tercatat di log audit."
              : "Testimoni tampil lagi di halaman kelas."
          }
          required={asking.hide}
          emptyMessage="Tulis alasan menyembunyikannya."
          confirmLabel={asking.hide ? "Sembunyikan" : "Pulihkan"}
          busy={false}
          onConfirm={confirm}
          onClose={() => setAsking(null)}
        />
      )}
    </section>
  );
}
