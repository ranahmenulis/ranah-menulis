import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SettingsHead } from "@/features/account/components/settings/settings-head";

afterEach(cleanup);

describe("SettingsHead", () => {
  it("shows the saved name and username without adding a heading", () => {
    render(<SettingsHead profile={{ name: "Rani Puspita", username: "rani", avatar: null }} />);
    expect(screen.getByText("Rani Puspita").tagName).toBe("P");
    expect(screen.getByText("@rani")).toBeTruthy();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("shows the photo when one is saved", () => {
    const { container } = render(
      <SettingsHead
        profile={{ name: "Rani", username: "rani", avatar: "data:image/webp;base64,AAAA" }}
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("data:image/webp;base64,AAAA");
  });

  it("leaves the username line out when there is none", () => {
    render(<SettingsHead profile={{ name: "Rani", username: "", avatar: null }} />);
    expect(screen.queryByText(/^@/)).toBeNull();
  });
});
