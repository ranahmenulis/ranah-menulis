import { describe, expect, it } from "vitest";
import { soloNotifications } from "@/features/projects/solo/solo-notifications";
import { withAdvance, withApproval, withFile } from "@/features/projects/solo/stage-model";
import { BASE, FULL, walked, withPreviews } from "./helpers";

describe("soloNotifications", () => {
  it("announces the team's stages and preview files, newest first, linking to the dashboard", () => {
    let row = walked(FULL, "cover");
    row = withFile(row, BASE, "cover", 5000);
    const out = soloNotifications([row]);
    expect(out.map((n) => n.text)).toEqual([
      "Pratinjau sampul versi 1 siap dilihat di Solo: Menerbitkan Bukumu Sendiri.",
      "Tahap desain cover dimulai untuk bukumu di Solo: Menerbitkan Bukumu Sendiri.",
      "Tahap proofreading dimulai untuk bukumu di Solo: Menerbitkan Bukumu Sendiri.",
    ]);
    expect(out[0].href).toBe("/projects/solo-penerbitan-buku-sendiri/dasbor");
    expect(new Set(out.map((n) => n.id)).size).toBe(3);
  });

  it("does not announce what the author did, and ignores a project that is gone", () => {
    const at = withPreviews(walked(FULL, "persetujuan-final"));
    const approved = withApproval(FULL, at, BASE, 9000)!;
    expect(soloNotifications([approved])).toHaveLength(soloNotifications([at]).length);
    expect(soloNotifications([{ ...at, slug: "tidak-ada" }])).toEqual([]);
    expect(withAdvance(FULL, null, BASE, 1)).not.toBeNull();
  });
});
