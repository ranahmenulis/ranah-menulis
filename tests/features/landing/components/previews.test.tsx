import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EditorPreview } from "@/features/landing/components/previews/editor-preview";
import { SharePreview } from "@/features/landing/components/previews/share-preview";
import { StreakPreview } from "@/features/landing/components/previews/streak-preview";
import { SubmissionPreview } from "@/features/landing/components/previews/submission-preview";
import { LoopTimeContext } from "@/features/landing/motion/use-loop";

afterEach(cleanup);

/** Renders a preview at a moment of its cycle; `null` is the finished picture. */
function at(time: number | null, preview: ReactNode) {
  return render(<LoopTimeContext value={time}>{preview}</LoopTimeContext>);
}

describe("landing previews, finished picture (server HTML, no motion)", () => {
  it("shows the editor saved with the whole sentence", () => {
    const { container } = at(null, <EditorPreview />);
    expect(screen.getByText("Tersimpan 14.02")).toBeTruthy();
    expect(screen.getByText("167 kata")).toBeTruthy();
    expect(container.textContent).toContain("Nenek menunggu dengan basah.");
  });

  it("shows today's target reached", () => {
    at(null, <StreakPreview />);
    expect(screen.getByText("Hari ini 500 / 500 kata")).toBeTruthy();
    expect(screen.getByText("Tercapai").className).not.toContain("opacity-0");
  });

  it("shows only the first paragraph ticked and the public-copy notice", () => {
    const { container } = at(null, <SharePreview />);
    const notice = screen.getByText("Yang menjadi publik hanya teks ini.").parentElement!;
    expect(notice.className).toContain("opacity-100");
    expect(container.querySelectorAll(".bg-subtle")).toHaveLength(1);
  });

  it("shows the submission accepted", () => {
    at(null, <SubmissionPreview />);
    expect(screen.getByText("Diterima")).toBeTruthy();
  });
});

describe("landing previews, inside a cycle", () => {
  it("types the last sentence before saving", () => {
    const { container } = at(400, <EditorPreview />);
    expect(screen.getByText("Menyimpan…")).toBeTruthy();
    expect(container.textContent).not.toContain("Nenek menunggu dengan basah.");
  });

  it("starts below the target", () => {
    at(300, <StreakPreview />);
    expect(screen.getByText("Hari ini 480 / 500 kata")).toBeTruthy();
  });

  it("starts with nothing ticked and the notice hidden", () => {
    const { container } = at(300, <SharePreview />);
    expect(container.querySelectorAll(".bg-subtle")).toHaveLength(0);
    const notice = screen.getByText("Yang menjadi publik hanya teks ini.").parentElement!;
    expect(notice.className).toContain("opacity-0");
  });

  it("starts as sent, never showing two labels at once", () => {
    at(300, <SubmissionPreview />);
    expect(screen.getByText("Dikirim")).toBeTruthy();
    expect(screen.queryByText("Diterima")).toBeNull();
  });
});
