import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { PostActionBar } from "@/features/community/components/post/post-action-bar";

afterEach(cleanup);

function Bar({ initial }: { initial: boolean }) {
  const [appreciated, setAppreciated] = useState(initial);
  return (
    <PostActionBar
      appreciations={appreciated ? 1 : 0}
      comments={0}
      appreciated={appreciated}
      saved={false}
      onAppreciate={() => setAppreciated((v) => !v)}
      onSave={() => {}}
      onShare={() => {}}
      onCopyLink={() => {}}
      onReport={() => {}}
    />
  );
}

const heart = () => screen.getByRole("button", { name: /Apresiasi/ }).querySelector("svg");

describe("PostActionBar appreciation", () => {
  it("does not pop a heart that was already on when the page opened", () => {
    render(<Bar initial />);
    expect(heart()?.getAttribute("class")).not.toContain("rm-heart-pop");
  });

  it("pops the heart when it is switched on, and not when it is switched off", () => {
    render(<Bar initial={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Apresiasi/ }));
    expect(heart()?.getAttribute("class")).toContain("rm-heart-pop");
    fireEvent.click(screen.getByRole("button", { name: /Apresiasi/ }));
    expect(heart()?.getAttribute("class")).not.toContain("rm-heart-pop");
  });
});
