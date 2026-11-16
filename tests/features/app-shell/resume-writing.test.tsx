import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResumeWriting } from "@/features/app-shell/resume-writing";

afterEach(cleanup);

describe("ResumeWriting", () => {
  it("draws nothing without a document to resume", () => {
    const { container } = render(<ResumeWriting variant="card" doc={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("links the card to the document and shows its title", () => {
    render(<ResumeWriting variant="card" doc={{ id: "d1", title: "Bab Satu" }} />);
    const link = screen.getByRole("link", { name: /Lanjutkan menulis/ });
    expect(link.getAttribute("href")).toBe("/studio/d1");
    expect(link.textContent).toContain("Bab Satu");
  });

  it("falls back to Tanpa judul for an empty or blank title", () => {
    render(<ResumeWriting variant="card" doc={{ id: "d1", title: "   " }} />);
    expect(screen.getByRole("link").textContent).toContain("Tanpa judul");
  });

  it("names the document in the icon version, which has no room for the title", () => {
    render(<ResumeWriting variant="icon" doc={{ id: "d2", title: "Cerpen Hujan" }} />);
    const link = screen.getByRole("link", { name: "Lanjutkan menulis: Cerpen Hujan" });
    expect(link.getAttribute("href")).toBe("/studio/d2");
    expect(link.textContent).toBe("Lanjutkan");
  });
});
