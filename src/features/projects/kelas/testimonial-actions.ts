import { readAccount } from "@/features/account/account-store";
import { ME_ID } from "@/features/community/fixtures/authors";
import { readViewerNow } from "@/lib/viewer";
import { liveRegistration } from "../payment-model";
import { resolveProjects } from "../project-model";
import { readRegistrations } from "../registration-store";
import { storedProjects } from "../stored-projects";
import { mergeCatalog } from "../use-catalog";
import { assignmentRows, hasStarted, resolveClass } from "./class-model";
import { classesFor } from "./class-source";
import { readMentorTasks } from "./mentor-task-store";
import type { AssignmentStore } from "./storage/assignment-store";
import { assignmentStore } from "./storage/store";
import {
  testimonialId,
  validateTestimonial,
  testimonialMessage,
  writeBlock,
  writeBlockText,
  type Testimonial,
} from "./testimonial-model";
import { testimonials } from "./testimonial-store";

export type TestimonialResult = { ok: true; message: string } | { ok: false; message: string };

const refuse = (message: string): TestimonialResult => ({ ok: false, message });

/**
 * Saves the reader's testimonial for a class, or changes the one they wrote (one per class). Reads
 * the registration, the class and the hand-ins again now, so a form opened a while ago cannot write
 * once the reader is no longer allowed to. Hiding by a curator is not touched here: a hidden
 * testimonial stays hidden after its author edits it.
 */
export async function saveTestimonial(
  input: { slug: string; text: string; showName: boolean },
  now: number,
  store: AssignmentStore = assignmentStore,
): Promise<TestimonialResult> {
  const { slug, text, showName } = input;
  if (readViewerNow().viewer === "tamu") return refuse("Masuk dulu untuk menulis testimoni.");
  const problem = validateTestimonial(text);
  if (problem) return refuse(testimonialMessage[problem]);

  if (liveRegistration(readRegistrations()[slug], now)?.status !== "terdaftar") {
    return refuse("Kamu belum terdaftar di kelas ini.");
  }
  const catalog = mergeCatalog(storedProjects.read());
  const project = resolveProjects(catalog, now).find(
    (p) => p.slug === slug && p.publication === "terbit" && p.block.kind === "kelas",
  );
  const fixture = classesFor(catalog).find((c) => c.slug === slug);
  const content = project && fixture ? resolveClass(fixture, project, readMentorTasks()) : null;
  if (!content) return refuse("Kelas ini tidak ditemukan.");

  let mine;
  try {
    mine = (await store.list()).filter((s) => s.slug === slug);
  } catch {
    return refuse("Data tugasmu belum terbaca. Coba lagi.");
  }
  const block = writeBlock(hasStarted(content, now), assignmentRows(content, mine, now));
  if (block) return refuse(writeBlockText[block]);

  const trimmed = text.trim();
  const name = readAccount().profile.name.trim();
  const all = testimonials.read();
  const existing = all.find((t) => t.slug === slug && t.authorId === ME_ID);
  if (existing) {
    const changed: Testimonial = { ...existing, text: trimmed, showName, name, updatedAt: now };
    testimonials.write(all.map((t) => (t.id === existing.id ? changed : t)));
    return { ok: true, message: "Testimoni diperbarui." };
  }
  const fresh: Testimonial = {
    id: testimonialId(slug, ME_ID, now),
    slug,
    authorId: ME_ID,
    name,
    text: trimmed,
    showName,
    createdAt: now,
    updatedAt: now,
  };
  testimonials.write([...all, fresh]);
  return { ok: true, message: "Testimoni terkirim." };
}

/** Removes the reader's own testimonial. A curator's earlier decision stays in the log. */
export function deleteTestimonial(slug: string): TestimonialResult {
  const all = testimonials.read();
  const mine = all.find((t) => t.slug === slug && t.authorId === ME_ID);
  if (!mine) return refuse("Testimoni ini sudah tidak ada.");
  testimonials.write(all.filter((t) => t.id !== mine.id));
  return { ok: true, message: "Testimoni dihapus." };
}
