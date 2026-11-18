import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FollowRow } from "@/features/home/follow-row";

afterEach(cleanup);

describe("FollowRow", () => {
  it("fades its scrolling edges and snaps every entry to the start", () => {
    render(
      <FollowRow
        items={[
          { name: "Rinjani", fresh: true, href: "/penulis/rinjani" },
          { name: "Grup Senja", fresh: false, href: "/grup/senja" },
        ]}
      />,
    );
    const list = screen.getByRole("list");
    expect(screen.getByRole("link", { name: "Grup Senja" }).getAttribute("href")).toBe(
      "/grup/senja",
    );
    expect(list.className).toContain("scroll-edge-fade");
    expect(list.className).toContain("snap-x");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item.className).toContain("snap-start");
    }
  });
});
