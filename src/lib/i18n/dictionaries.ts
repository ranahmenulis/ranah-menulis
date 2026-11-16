import type { Locale } from "./config";
import { common as commonId } from "./common/id";
import { common as commonEn } from "./common/en";
import { landing as landingId } from "@/features/landing/copy/id";
import { landing as landingEn } from "@/features/landing/copy/en";
import { shell as shellId } from "@/features/app-shell/copy/id";
import { shell as shellEn } from "@/features/app-shell/copy/en";

import { account as accountId } from "@/features/account/copy/id";
import { account as accountEn } from "@/features/account/copy/en";

/** Indonesian is the source of truth for the shape; English must provide the same keys. */
export const id = { common: commonId, landing: landingId, shell: shellId, account: accountId };
export type Dictionary = typeof id;

const en: Dictionary = {
  common: commonEn,
  landing: landingEn,
  shell: shellEn,
  account: accountEn,
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
