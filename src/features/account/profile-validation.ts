import type { AccountProfile } from "./account-store";
import { bioIssue, nameIssue, usernameIssue, type Issue } from "./validation";

export type ProfileField = "name" | "username" | "bio";
export type ProfileIssues = Partial<Record<ProfileField, Issue>>;

/**
 * Everything on the profile form that can be wrong. Country, zone, genres, and photo are picked
 * from fixed choices, so only these three can fail; the photo is checked when it is chosen.
 */
export function profileIssues(
  profile: Pick<AccountProfile, ProfileField>,
  taken: (username: string) => boolean,
): ProfileIssues {
  const issues: ProfileIssues = {};
  const name = nameIssue(profile.name);
  if (name) issues.name = name;
  const username = usernameIssue(profile.username, taken);
  if (username) issues.username = username;
  const bio = bioIssue(profile.bio);
  if (bio) issues.bio = bio;
  return issues;
}

/** What is saved: names and bio trimmed, the username in its lower-case form. */
export function cleanProfile(profile: AccountProfile, normalize: (v: string) => string) {
  return {
    ...profile,
    name: profile.name.trim(),
    username: normalize(profile.username),
    bio: profile.bio.trim(),
  };
}
