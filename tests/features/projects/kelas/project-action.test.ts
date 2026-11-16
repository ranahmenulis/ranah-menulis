import { describe, expect, it } from "vitest";
import { projectAction } from "@/features/projects/project-action";
import { projectState } from "@/features/projects/project-model";
import { NOW, project, registration } from "../helpers";
import { CERPEN, PUISI } from "./helpers";

function action(
  slug: string,
  over: { guest?: boolean; registration?: ReturnType<typeof registration> } = {},
) {
  const p = project(slug);
  return projectAction({
    project: p,
    state: projectState(p, NOW),
    guest: false,
    now: NOW,
    sentCount: 0,
    ...over,
  });
}

describe("projectAction for a class", () => {
  it("opens the class dashboard once registered", () => {
    expect(action(CERPEN, { registration: registration(CERPEN) })).toMatchObject({
      label: "Buka dasbor kelas",
      enabled: true,
      href: `/projects/${CERPEN}/dasbor`,
      sentLine: null,
    });
  });

  it("keeps the payment wording while the registration waits", () => {
    const waiting = registration(PUISI, { status: "menunggu-pembayaran" });
    expect(action(PUISI, { registration: waiting })).toMatchObject({
      label: "Menunggu pembayaran",
      enabled: false,
    });
  });

  it("still asks to register before anything, and gives a guest no dashboard", () => {
    expect(action(CERPEN)).toMatchObject({ label: "Daftar", enabled: true });
    const guest = action(CERPEN, { guest: true, registration: registration(CERPEN) });
    expect(guest.label).not.toBe("Buka dasbor kelas");
  });

  it("does not change the action of a category that takes work", () => {
    const esai = "lomba-esai-literasi-remaja";
    expect(action(esai, { registration: registration(esai) }).label).toBe("Kirim karya");
  });
});
