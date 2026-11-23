import { describe, expect, it } from "vitest";
import { kelolaOrganizerTabs as tabsEn } from "@/features/kelola/organizer/copy/tabs-en";
import { kelolaOrganizerTabs as tabsId } from "@/features/kelola/organizer/copy/tabs-id";
import { kelolaOrganizerEvents as eventsEn } from "@/features/kelola/organizer/events/copy-en";
import { kelolaOrganizerEvents as eventsId } from "@/features/kelola/organizer/events/copy-id";
import { buildEvent, inputOf } from "@/features/kelola/organizer/events/event-input";
import { paymentStateText } from "@/features/kelola/organizer/payment-rows";
import {
  FINALISTS_KEY,
  lockText,
  validateResults,
} from "@/features/kelola/organizer/results-model";
import { decisionText } from "@/features/kelola/organizer/testimonial-actions";

function shape(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    const slots = [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    return [`${prefix}=${slots.join(",")}`];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    shape(child, `${prefix}.${key}`),
  );
}

describe("Organizer tab and event dictionaries", () => {
  it("English has the same keys and placeholders as Indonesian", () => {
    expect(shape(tabsEn)).toEqual(shape(tabsId));
    expect(shape(eventsEn)).toEqual(shape(eventsId));
  });

  it("keeps the Indonesian lock text", () => {
    expect(lockText.terkunci).toBe("Pemenang sudah diumumkan. Pengumuman tidak bisa diubah.");
  });

  it("validates results in the requested language", () => {
    expect(validateResults({ finalists: {}, ranks: {}, notes: {} }, [], 3)[FINALISTS_KEY]).toBe(
      "Pilih minimal satu finalis.",
    );
    expect(
      validateResults({ finalists: {}, ranks: {}, notes: {} }, [], 3, "en")[FINALISTS_KEY],
    ).toBe("Choose at least one finalist.");
  });

  it("builds event issues in the requested language", () => {
    const result = buildEvent(inputOf(), "en");
    expect(result).toMatchObject({ ok: false, errors: { title: "Fill in this field." } });
    expect(buildEvent(inputOf())).toMatchObject({
      ok: false,
      errors: { title: "Isi bidang ini." },
    });
  });

  it("translates testimonial decisions and payment states", () => {
    expect(decisionText("gone")).toBe("Testimoni ini sudah dihapus penulisnya.");
    expect(decisionText("gone", "en")).toBe("The author has already deleted this testimonial.");
    expect(paymentStateText("lunas", "en")).toBe("Paid");
    expect(paymentStateText("lunas")).toBe("Lunas");
  });
});
