import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FirstSteps } from "./steps";

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
});
