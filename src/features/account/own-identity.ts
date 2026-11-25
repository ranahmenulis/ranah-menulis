import { ME_ID, authors } from "@/features/community/fixtures/authors";
import type { Author } from "@/features/community/types";
import { profileHref } from "@/features/profile/profile-href";
import type { Account } from "./account-store";

/**
 * Whether the dummy reader's sample world (the posts, followers, notifications, and circle invite
 * that belong to "me" in the fixtures) is shown. An account made on the Daftar screen starts empty,
 * so it is not; the untouched dummy reader (also used for role testing) keeps it.
 */
export const showsSampleWorld = (account: Pick<Account, "registered">): boolean =>
  account.registered !== true;

const FIXTURE_ME = authors.find((a) => a.id === ME_ID) as Author;

/**
 * The Community author record for the reader. The id stays `ME_ID`, so everything written on this
 * device keeps pointing at it; only what is shown (name, handle, country) follows the account.
 */
export function ownAuthor(account: Account): Author {
  if (showsSampleWorld(account)) return FIXTURE_ME;
  return {
    id: ME_ID,
    name: account.profile.name.trim() || "Penulis",
    handle: account.profile.username.trim() || ME_ID,
    country: account.profile.country,
  };
}

/** The address of the reader's own profile page. */
export const ownProfileHref = (account: Account): string => profileHref(ownAuthor(account).handle);
