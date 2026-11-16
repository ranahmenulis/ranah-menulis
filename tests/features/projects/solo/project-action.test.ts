import { describe, expect, it } from "vitest";
import { projectAction } from "@/features/projects/project-action";
import { projectState } from "@/features/projects/project-model";
import { NOW, project, registration } from "../helpers";
import { SOLO } from "./helpers";

function action(
  sentCount: number | null,
  status: "terdaftar" | "menunggu-pembayaran" = "terdaftar",
) {
  const p = project(SOLO);
  return projectAction({
    project: p,
    state: projectState(p, NOW),
    guest: false,
    now: NOW,
    sentCount,
    registration: registration(SOLO, { status, packageName: "Terbit Lengkap" }),
  });
}

describe("projectAction for a Solo book", () => {
  it("opens the dashboard once the manuscript was sent", () => {
    expect(action(1)).toMatchObject({
      label: "Buka dasbor",
      enabled: true,
      href: `/projects/${SOLO}/dasbor`,
      sentLine: "1 dari 1 karya",
    });
  });

  it("still asks for the manuscript before anything was sent, and while the count is unknown", () => {
    expect(action(0).label).toBe("Kirim karya");
    expect(action(null).label).toBe("Kirim karya");
    expect(action(null).enabled).toBe(false);
  });

  it("does not open the dashboard before the payment is confirmed", () => {
    expect(action(1, "menunggu-pembayaran").label).not.toBe("Buka dasbor");
  });
});
