import {
  mergeAccount,
  type Account,
  type AccountPatch,
  type AccountProfile,
} from "./account-model";
import type { LiveAccount } from "./account-store";
import type { AccountGateway } from "./account-gateway";
import { accountToUpdate } from "./profile-mapping";

type Deps = {
  userId: string;
  gateway: AccountGateway;
  /** The account on screen right now. */
  read(): Account | null;
  /** Puts an account on screen (and remembers it as the current one). */
  write(next: Account): void;
};

/**
 * The signed-in account's saving, behind the screen: a change shows at once, the profile row is
 * written after it, and a refused write puts the old values back. The photo goes to storage before
 * the fields so the row never points at a file that is not there.
 */
export function createLiveAccount({ userId, gateway, read, write }: Deps): LiveAccount {
  /** Undo `after` unless something newer replaced it meanwhile. */
  function revert(before: Account, after: Account) {
    if (read() === after) write(before);
  }

  return {
    get: () => read() as Account,

    async update(patch: AccountPatch) {
      const before = read();
      if (!before) return "failed";
      const after = mergeAccount(before, patch);
      const row = accountToUpdate(after);
      write(after);
      // Email and password time are not in the profile row: nothing to write.
      if (JSON.stringify(row) === JSON.stringify(accountToUpdate(before))) return "ok";
      const result = await gateway.updateProfile(userId, row);
      if (result !== "ok") revert(before, after);
      return result;
    },

    async saveProfile(profile: AccountProfile, options) {
      const before = read();
      if (!before) return "failed";
      let avatar = profile.avatar;
      let photoColumn: { avatar_path: string | null } | null = null;
      if (profile.avatar !== before.profile.avatar) {
        if (profile.avatar === null) {
          await gateway.removePhoto(userId);
          photoColumn = { avatar_path: null };
        } else if (profile.avatar.startsWith("data:")) {
          const stored = await gateway.uploadPhoto(userId, profile.avatar);
          if (!stored.ok) return "photo-failed";
          photoColumn = { avatar_path: stored.path };
          avatar = `${stored.url}?v=${Date.now()}`;
        }
      }
      const after = mergeAccount(before, { profile: { ...profile, avatar } });
      write(after);
      const result = await gateway.updateProfile(userId, {
        ...accountToUpdate(after),
        ...photoColumn,
        ...(options?.finish ? { onboarded_at: new Date().toISOString() } : {}),
      });
      if (result !== "ok") revert(before, after);
      return result;
    },
  };
}
