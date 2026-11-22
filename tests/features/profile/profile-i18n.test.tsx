import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";
import { ProfileError, ProfileGone } from "@/features/profile/components/profile-states";
import { ProjectsTab, WorksEmpty } from "@/features/profile/components/profile-tabs-content";
import { profile as en } from "@/features/profile/copy/en";
import { profile as id } from "@/features/profile/copy/id";
import { saved as savedEn } from "@/features/saved/copy/en";
import { saved as savedId } from "@/features/saved/copy/id";
import { notifications as notificationsEn } from "@/features/notifications/copy/en";
import { notifications as notificationsId } from "@/features/notifications/copy/id";

afterEach(cleanup);

const english = (node: React.ReactNode) =>
  render(
    <I18nProvider locale="en" dictionary={dictionaries.en}>
      {node}
    </I18nProvider>,
  );

const keys = (o: object): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === "object" ? keys(v).map((x) => `${k}.${x}`) : [k],
  );

describe("copy parity for phase 2 features", () => {
  it("has English for every Indonesian key and no empty text", () => {
    for (const [source, target] of [
      [id, en],
      [savedId, savedEn],
      [notificationsId, notificationsEn],
    ] as const) {
      expect(keys(target)).toEqual(keys(source));
    }
    for (const text of [...Object.values(en), ...Object.values(savedEn)]) {
      if (typeof text === "string") expect(text).not.toBe("");
    }
  });
});

describe("profile screens in English", () => {
  it("says a writer is not found, with a way back", () => {
    english(<ProfileGone />);
    expect(screen.getByText("This writer could not be found.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeTruthy();
  });

  it("offers a retry when the profile fails to load", () => {
    english(<ProfileError onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.getByText(/could not be loaded/)).toBeTruthy();
  });

  it("writes the empty works and projects states for yourself and others", () => {
    english(<WorksEmpty own />);
    expect(screen.getByText("You have not shared any writing publicly yet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Write a post" })).toBeTruthy();
    cleanup();
    english(<ProjectsTab own={false} />);
    expect(screen.getByText("No projects shown yet.")).toBeTruthy();
  });
});
