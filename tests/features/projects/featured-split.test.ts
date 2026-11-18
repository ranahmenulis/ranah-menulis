import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { featuredProjects } from "@/features/projects/featured-store";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { useFeaturedSplit } from "@/features/projects/hooks/use-featured-split";
import { resolveProjects, DEFAULT_FILTERS } from "@/features/projects/project-model";

const list = resolveProjects(projectFixtures, Date.now()).filter((p) => p.publication === "terbit");

beforeEach(() => featuredProjects.reset());

describe("useFeaturedSplit", () => {
  it("leads with the marked projects in marking order and drops them from the rest", () => {
    featuredProjects.write([
      { slug: list[1].slug, at: 1 },
      { slug: list[0].slug, at: 2 },
    ]);
    const { result } = renderHook(() => useFeaturedSplit(list, DEFAULT_FILTERS));
    expect(result.current.featured.map((p) => p.slug)).toEqual([list[1].slug, list[0].slug]);
    expect(result.current.rest).toHaveLength(list.length - 2);
  });

  it("shows no block while a filter narrows the page", () => {
    featuredProjects.write([{ slug: list[0].slug, at: 1 }]);
    const { result } = renderHook(() =>
      useFeaturedSplit(list, { ...DEFAULT_FILTERS, fee: "gratis" }),
    );
    expect(result.current.featured).toEqual([]);
    expect(result.current.rest).toBe(list);
  });
});
