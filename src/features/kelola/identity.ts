import { ME_ID } from "@/features/community/fixtures/authors";

/**
 * The signed-in dummy account, the same person as DUMMY_USER and the Community author "me". Before
 * 6g-5 each management role had its own fixed id ("editor-kamu" and so on); data written then is
 * still read as this account, so nothing created on a device is lost. Real accounts replace this.
 */
export { ME_ID };

const LEGACY_SELF_IDS: readonly string[] = [
  "editor-kamu",
  "mentor-kamu",
  "juri-kamu",
  "organizer-kamu",
];

/** The id data is compared by: the old per-role ids of the dummy account become `ME_ID`. */
export const canonicalId = (id: string): string => (LEGACY_SELF_IDS.includes(id) ? ME_ID : id);

export const isSelf = (id: string): boolean => canonicalId(id) === ME_ID;
