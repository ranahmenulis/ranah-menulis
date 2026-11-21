import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectStrip } from "@/features/projects/components/project-strip";

const project = { slug: "kelas-x", category: "kelas" as const, title: "Kelas Cerpen" };

afterEach(cleanup);

describe("ProjectStrip", () => {
  it("names the category and the project, with the cover hidden from assistive tech", () => {
    const { container } = render(<ProjectStrip project={project} />);
    expect(screen.getByText("Kelas Menulis", { selector: "p" })).toBeTruthy();
    expect(screen.getByText("Kelas Cerpen").tagName).toBe("P");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(container.querySelector("[data-cover]")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("becomes the screen's title when asked, so the name is not printed twice", () => {
    render(<ProjectStrip project={project} titleAs="h1" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Kelas Cerpen");
  });

  it("links the title to the project only when asked", () => {
    const { rerender } = render(<ProjectStrip project={project} />);
    expect(screen.queryByRole("link")).toBeNull();
    rerender(<ProjectStrip project={project} linked />);
    expect(screen.getByRole("link", { name: "Kelas Cerpen" }).getAttribute("href")).toBe(
      "/projects/kelas-x",
    );
  });
});
