import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BandFigure, DashboardBand } from "@/features/projects/components/dashboard-band";

const project = { slug: "solo-x", category: "solo" as const, title: "Terbitkan Bukumu" };

afterEach(cleanup);

describe("DashboardBand", () => {
  it("titles the screen with the project, under what the page is, on a dark band", () => {
    const { container } = render(<DashboardBand project={project} eyebrow="Dasbor penerbitan" />);
    const title = screen.getByRole("heading", { level: 1 });
    expect(title.textContent).toBe("Terbitkan Bukumu");
    expect(title.hasAttribute("tabindex")).toBe(false);
    expect(screen.getByText("Dasbor penerbitan")).toBeTruthy();
    expect(container.querySelector("section")?.className).toContain("app-band");
    expect(container.querySelector("[data-cover]")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("lets focus move to the title when given an id", () => {
    render(<DashboardBand project={project} eyebrow="Dasbor" titleId="judul" />);
    const title = screen.getByRole("heading", { level: 1 });
    expect(title.id).toBe("judul");
    expect(title.getAttribute("tabindex")).toBe("-1");
  });

  it("shows the figure with its caption", () => {
    render(
      <DashboardBand project={project} eyebrow="Dasbor">
        <BandFigure figure="3/6" caption="Tahap 3 dari 6 · Proofreading" />
      </DashboardBand>,
    );
    expect(screen.getByText("3/6")).toBeTruthy();
    expect(screen.getByText("Tahap 3 dari 6 · Proofreading")).toBeTruthy();
  });
});
