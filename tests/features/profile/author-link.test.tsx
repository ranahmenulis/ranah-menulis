import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { resolveFixturePosts } from "@/features/community/post-model";
import { FeedItem } from "@/features/home/feed-item";
import { AuthorLink } from "@/features/profile/author-link";

afterEach(cleanup);

describe("AuthorLink", () => {
  it("links to the author's profile and sits above stretched links", () => {
    render(<AuthorLink handle="hafizrahman">Hafiz Rahman</AuthorLink>);
    const link = screen.getByRole("link", { name: "Hafiz Rahman" });
    expect(link.getAttribute("href")).toBe("/penulis/hafizrahman");
    expect(link.className).toContain("z-10");
  });
});

describe("FeedItem author", () => {
  it("opens the author's profile from the name, apart from the link to the post", () => {
    const post = resolveFixturePosts(Date.now()).find((p) => p.authorId === "nur-aisyah")!;
    render(
      <FeedItem
        post={post}
        now={Date.now()}
        comments={0}
        appreciated={false}
        saved={false}
        onAppreciate={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByRole("link", { name: "Nur Aisyah" }).getAttribute("href")).toBe(
      "/penulis/nuraisyah",
    );
    expect(
      screen.getAllByRole("link").some((a) => a.getAttribute("href") === `/postingan/${post.id}`),
    ).toBe(true);
  });
});
