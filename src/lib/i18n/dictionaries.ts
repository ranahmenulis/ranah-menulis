import type { Locale } from "./config";
import { common as commonId } from "./common/id";
import { common as commonEn } from "./common/en";
import { titles as titlesId } from "./titles/id";
import { titles as titlesEn } from "./titles/en";
import { landing as landingId } from "@/features/landing/copy/id";
import { landing as landingEn } from "@/features/landing/copy/en";
import { shell as shellId } from "@/features/app-shell/copy/id";
import { shell as shellEn } from "@/features/app-shell/copy/en";
import { account as accountId } from "@/features/account/copy/id";
import { account as accountEn } from "@/features/account/copy/en";
import { home as homeId } from "@/features/home/copy/id";
import { home as homeEn } from "@/features/home/copy/en";
import { saved as savedId } from "@/features/saved/copy/id";
import { saved as savedEn } from "@/features/saved/copy/en";
import { notifications as notificationsId } from "@/features/notifications/copy/id";
import { notifications as notificationsEn } from "@/features/notifications/copy/en";
import { profile as profileId } from "@/features/profile/copy/id";
import { profile as profileEn } from "@/features/profile/copy/en";

/** Indonesian is the source of truth for the shape; English must provide the same keys. */
export const id = {
  common: commonId,
  landing: landingId,
  shell: shellId,
  account: accountId,
  titles: titlesId,
  home: homeId,
  saved: savedId,
  notifications: notificationsId,
  profile: profileId,
};
export type Dictionary = typeof id;

const en: Dictionary = {
  common: commonEn,
  landing: landingEn,
  shell: shellEn,
  account: accountEn,
  titles: titlesEn,
  home: homeEn,
  saved: savedEn,
  notifications: notificationsEn,
  profile: profileEn,
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
