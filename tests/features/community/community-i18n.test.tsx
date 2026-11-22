import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { missingHint, initialCompose } from "@/features/community/compose-state";
import { compose as composeEn } from "@/features/community/copy/compose-en";
import { events as eventsEn } from "@/features/community/copy/events-en";
import { groups as groupsEn } from "@/features/community/copy/groups-en";
import { countdownLabel, spanLabel } from "@/features/community/events/event-face";
import { eventMessage } from "@/features/community/events/event-messages";
import { PostGone } from "@/features/community/components/post/post-states";
import { groupErrors } from "@/features/community/groups/group-model";
import { groupMessage, GROUP_MESSAGES } from "@/features/community/groups/group-messages";
import { refuseGroup } from "@/features/community/groups/group-actions";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";

afterEach(cleanup);

describe("group messages", () => {
  it("keeps the Indonesian text next to the code", () => {
    const result = refuseGroup("nameRequired");
    expect(result).toMatchObject({ ok: false, code: "nameRequired", message: "Isi nama grup." });
  });

  it("fills the limit and translates by code", () => {
    expect(groupMessage("nameTooLong")).toBe("Nama grup maksimal 40 karakter.");
    expect(groupMessage("nameTooLong", groupsEn.messages, "en")).toBe(
      "The group name can be up to 40 characters.",
    );
    expect(groupMessage("reasonTooLong", groupsEn.messages, "en")).toContain("1,000");
  });

  it("has an English sentence for every code", () => {
    for (const code of Object.keys(GROUP_MESSAGES) as (keyof typeof GROUP_MESSAGES)[]) {
      expect(groupsEn.messages[code].length).toBeGreaterThan(0);
    }
  });

  it("reports form problems as codes", () => {
    expect(groupErrors({ name: " ", description: "", visibility: "privat" }).name).toBe(
      "nameRequired",
    );
  });
});

describe("event time and messages", () => {
  it("writes spans and countdowns in English", () => {
    expect(spanLabel(26 * 3_600_000, "en")).toBe("1 days 2 hr");
    expect(spanLabel(10_000, "en")).toBe("less than 1 minute");
    expect(countdownLabel({ startsAt: 10 * 60_000, endsAt: 20 * 60_000 }, 0, "en")).toBe(
      "Starts in 10 min",
    );
    expect(countdownLabel({ startsAt: 0, endsAt: 1 }, 5, "en")).toBe("The event is over");
  });

  it("keeps the Indonesian countdown by default", () => {
    expect(countdownLabel({ startsAt: 60_000, endsAt: 120_000 }, 0)).toBe("Mulai dalam 1 menit");
  });

  it("fills the status of a closed registration", () => {
    const text = eventMessage(
      { code: "registrationClosed", state: "full" },
      eventsEn.messages,
      eventsEn.status,
    );
    expect(text).toBe("Registration is not available. Full.");
  });
});

describe("compose hint", () => {
  it("lists what is missing in each language", () => {
    const state = { ...initialCompose, tab: "direct" as const };
    expect(missingHint(state)).toContain("Untuk menerbitkan, lengkapi judul");
    expect(missingHint(state, composeEn.form, "en")).toBe(
      "To publish, complete the title, the text, the genre, and who can read it.",
    );
  });
});

describe("English rendering", () => {
  it("shows the unavailable post message in English", () => {
    render(
      <I18nProvider locale="en" dictionary={dictionaries.en}>
        <PostGone />
      </I18nProvider>,
    );
    expect(screen.getByText("This post is not available.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to Community" })).toBeTruthy();
  });
});
