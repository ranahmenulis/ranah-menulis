"use client";

import { createLocalListStore } from "./local-list-store";

export const COMMUNITY_LINK_LIMIT = 200;

/** Only a plain https address is ever followed out of the app. */
export function isHttpsLink(text: string): boolean {
  if (text.length > COMMUNITY_LINK_LIMIT) return false;
  try {
    return new URL(text).protocol === "https:";
  } catch {
    return false;
  }
}

/** Platform-level settings (PLT-12). One item at most; no item means nothing is set. */
export type PlatformSettings = { communityLink: string };

const isSettings = (value: unknown): value is PlatformSettings =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Record<string, unknown>).communityLink === "string" &&
  isHttpsLink((value as { communityLink: string }).communityLink);

export const platformSettings = createLocalListStore<PlatformSettings>(
  "ranah.platformSettings",
  isSettings,
);

/** The official outside community link, or null while none is set (the section is then not shown). */
export function useCommunityLink(): string | null {
  return platformSettings.use()[0]?.communityLink ?? null;
}
