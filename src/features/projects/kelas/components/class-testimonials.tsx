"use client";

import { Section } from "../../components/category-blocks";
import { publicName, visibleTestimonials } from "../testimonial-model";
import { useAllTestimonials } from "../testimonial-store";

/**
 * What participants say about the class (KLS-07), on the class page. Only testimonials that are not
 * hidden; the section is not drawn at all when there is none. Text is shown as plain text.
 */
export function ClassTestimonials({ slug }: { slug: string }) {
  const { items, decisions } = useAllTestimonials();
  const shown = visibleTestimonials(items, decisions, slug);
  if (shown.length === 0) return null;
  return (
    <Section title="Testimoni peserta">
      <ul className="grid gap-5">
        {shown.map((t) => (
          <li key={t.id}>
            <figure className="grid gap-1">
              <blockquote className="text-base wrap-anywhere whitespace-pre-line">
                {t.text}
              </blockquote>
              <figcaption className="text-sm text-ink-muted">{publicName(t)}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
