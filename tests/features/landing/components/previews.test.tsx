import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CommunityPreview } from "@/features/landing/components/previews/community-preview";
import { MarketplacePreview } from "@/features/landing/components/previews/marketplace-preview";
import { StreakPreview } from "@/features/landing/components/previews/streak-preview";
import { SubmissionPreview } from "@/features/landing/components/previews/submission-preview";
import { LoopTimeContext } from "@/features/landing/motion/use-loop";

afterEach(cleanup);

/** Renders a preview at a moment of its cycle; `null` is the finished picture. */
function at(time: number | null, preview: ReactNode) {
  return render(<LoopTimeContext value={time}>{preview}</LoopTimeContext>);
}

describe("landing previews, finished picture (server HTML, no motion)", () => {
  it("shows today's target reached", () => {
    at(null, <StreakPreview />);
    expect(screen.getByText("Hari ini 500 / 500 kata")).toBeTruthy();
    expect(screen.getByText("Tercapai").className).not.toContain("opacity-0");
  });

  it("shows the submission accepted", () => {
    at(null, <SubmissionPreview />);
    expect(screen.getByText("Diterima")).toBeTruthy();
  });
});

describe("landing previews, inside a cycle", () => {
  it("starts below the target", () => {
    at(300, <StreakPreview />);
    expect(screen.getByText("Hari ini 480 / 500 kata")).toBeTruthy();
  });

  it("starts as sent, never showing two labels at once", () => {
    at(300, <SubmissionPreview />);
    expect(screen.getByText("Dikirim")).toBeTruthy();
    expect(screen.queryByText("Diterima")).toBeNull();
  });
});

describe("landing still previews", () => {
  it("shows the Community programs as coming later", () => {
    render(<CommunityPreview />);
    for (const p of ["Writer Battle", "Roast My Writing", "The Writers Confess"]) {
      expect(screen.getByText(p)).toBeTruthy();
    }
    expect(screen.getByText("Menyusul")).toBeTruthy();
  });

  it("shows the Marketplace categories without a price", () => {
    const { container } = render(<MarketplacePreview />);
    expect(screen.getByText("Event literasi")).toBeTruthy();
    expect(container.textContent).not.toMatch(/Rp|RM/);
  });
});
