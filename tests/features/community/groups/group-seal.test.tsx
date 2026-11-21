import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GroupSeal, SEAL_DOTS } from "@/features/community/groups/components/group-seal";

afterEach(cleanup);

const members = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ authorId: `p${i}`, admin: false, membershipId: `m${i}` }));

describe("GroupSeal", () => {
  it("prints the first letter and one dot per member, hidden from readers", () => {
    const { container } = render(
      <GroupSeal group={{ id: "g1", name: "ruang cerpen", members: members(5) as never }} />,
    );
    const seal = container.firstElementChild!;
    expect(seal.getAttribute("aria-hidden")).toBe("true");
    expect(seal.textContent).toBe("R");
    expect(seal.querySelectorAll("circle.rm-pop")).toHaveLength(5);
  });

  it("stops adding dots once the ring is full", () => {
    const { container } = render(
      <GroupSeal group={{ id: "g2", name: "Besar", members: members(80) as never }} />,
    );
    expect(container.querySelectorAll("circle.rm-pop")).toHaveLength(SEAL_DOTS);
  });

  it("looks the same for the same group", () => {
    const group = { id: "g3", name: "Pesisir", members: members(3) as never };
    const a = render(<GroupSeal group={group} />).container.innerHTML;
    cleanup();
    expect(render(<GroupSeal group={group} />).container.innerHTML).toBe(a);
  });
});
