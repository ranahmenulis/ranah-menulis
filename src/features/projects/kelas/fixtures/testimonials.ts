import type { Testimonial } from "../testimonial-model";

/**
 * Made-up testimonials so the class page has something to show [konfirmasi]. They are examples, not
 * words of real participants, and a curator can hide them like any other.
 */
export const sampleTestimonials: readonly Testimonial[] = [
  {
    id: "contoh-cerpen-1",
    slug: "kelas-cerpen-untuk-pemula",
    authorId: "contoh",
    name: "Nadia Rahmawati",
    text: "Kerangka tiga babak membuat cerpenku akhirnya punya arah. Catatan mentor singkat tapi tepat.",
    showName: true,
    createdAt: Date.UTC(2026, 9, 12),
    updatedAt: Date.UTC(2026, 9, 12),
    sample: true,
  },
  {
    id: "contoh-cerpen-2",
    slug: "kelas-cerpen-untuk-pemula",
    authorId: "contoh",
    name: "Contoh Peserta",
    text: "Latihan di tiap materi pendek, jadi mudah dikerjakan sepulang kerja.",
    showName: false,
    createdAt: Date.UTC(2026, 9, 14),
    updatedAt: Date.UTC(2026, 9, 14),
    sample: true,
  },
];
