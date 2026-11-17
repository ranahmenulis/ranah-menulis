import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetFirstStepsFallback } from "@/features/home/first-steps-store";
import { FirstSteps } from "@/features/home/steps";

beforeEach(() => {
  window.localStorage.clear();
  resetFirstStepsFallback();
});
afterEach(cleanup);

describe("FirstSteps", () => {
  it("lists three steps with an action for each one that is not done", () => {
    render(<FirstSteps hasTarget={false} hasDocument={false} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Tetapkan" }).getAttribute("href")).toBe(
      "/studio/streak",
    );
    expect(screen.getByRole("link", { name: "Buka Studio" }).getAttribute("href")).toBe(
      "/studio/baru",
    );
    expect(screen.getByText("Selesai")).toBeTruthy();
  });

  it("drops the action of a step once it is done", () => {
    render(<FirstSteps hasTarget hasDocument={false} />);
    expect(screen.queryByRole("link", { name: "Tetapkan" })).toBeNull();
    expect(screen.getAllByText("Selesai")).toHaveLength(2);
  });

  it("disappears when all three are done", () => {
    const { container } = render(<FirstSteps hasTarget hasDocument />);
    expect(container.firstChild).toBeNull();
  });

  it("goes away for good when the writer closes it, and moves focus to the page title", () => {
    const title = document.createElement("h1");
    title.id = "beranda-title";
    title.tabIndex = -1;
    document.body.append(title);

    const { container, unmount } = render(<FirstSteps hasTarget={false} hasDocument={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Tutup panduan" }));

    expect(container.firstChild).toBeNull();
    expect(document.activeElement).toBe(title);
    expect(window.localStorage.getItem("ranah.firstStepsDismissed")).toBe("1");

    unmount();
    const again = render(<FirstSteps hasTarget={false} hasDocument={false} />);
    expect(again.container.firstChild).toBeNull();
    title.remove();
  });
});
