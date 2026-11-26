"use client";

import { useMemo } from "react";
import { createLocalListStore } from "@/lib/local-list-store";
import {
  testimonialDecisionsRemoteSync,
  testimonialsRemoteSync,
} from "../storage/remote/remote-project-lists";
import { sampleTestimonials } from "./fixtures/testimonials";
import type { Testimonial, TestimonialDecision } from "./testimonial-model";

const isText = (v: unknown): v is string => typeof v === "string";
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Every field a screen reads is checked, so edited data cannot break a page. */
function isTestimonial(value: unknown): value is Testimonial {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isText(v.id) &&
    isText(v.slug) &&
    isText(v.authorId) &&
    isText(v.name) &&
    isText(v.text) &&
    typeof v.showName === "boolean" &&
    isNumber(v.createdAt) &&
    isNumber(v.updatedAt)
  );
}

function isDecision(value: unknown): value is TestimonialDecision {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isText(v.testimonialId) &&
    (v.slug === undefined || isText(v.slug)) &&
    (v.state === "disembunyikan" || v.state === "dipulihkan") &&
    isNumber(v.at) &&
    isText(v.by) &&
    (v.reason === undefined || isText(v.reason))
  );
}

/** Written by participants, kept on this device until the backend exists. */
export const testimonials = createLocalListStore<Testimonial>(
  "ranah.testimonials",
  isTestimonial,
  [],
  testimonialsRemoteSync,
);

/** Append-only: nothing edits or removes a decision. */
export const testimonialDecisions = createLocalListStore<TestimonialDecision>(
  "ranah.testimonialDecisions",
  isDecision,
  [],
  testimonialDecisionsRemoteSync,
);

/** The made-up examples and what participants wrote. A written one never carries `sample`. */
export const allTestimonials = (): Testimonial[] => [
  ...sampleTestimonials,
  ...testimonials.read().map((t) => ({ ...t, sample: undefined })),
];

export function useAllTestimonials(): { items: Testimonial[]; decisions: TestimonialDecision[] } {
  const stored = testimonials.use();
  const decisions = testimonialDecisions.use();
  return useMemo(
    () => ({
      items: [...sampleTestimonials, ...stored.map((t) => ({ ...t, sample: undefined }))],
      decisions: [...decisions],
    }),
    [stored, decisions],
  );
}
