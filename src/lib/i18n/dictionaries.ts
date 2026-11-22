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
import { community as communityId } from "@/features/community/copy/shared-id";
import { community as communityEn } from "@/features/community/copy/shared-en";
import { discover as discoverId } from "@/features/community/copy/discover-id";
import { discover as discoverEn } from "@/features/community/copy/discover-en";
import { post as postId } from "@/features/community/copy/post-id";
import { post as postEn } from "@/features/community/copy/post-en";
import { compose as composeId } from "@/features/community/copy/compose-id";
import { compose as composeEn } from "@/features/community/copy/compose-en";
import { groups as groupsId } from "@/features/community/copy/groups-id";
import { groups as groupsEn } from "@/features/community/copy/groups-en";
import { events as eventsId } from "@/features/community/copy/events-id";
import { events as eventsEn } from "@/features/community/copy/events-en";
import { studioLayout as studioLayoutId } from "@/features/studio/copy/layout-id";
import { studioLayout as studioLayoutEn } from "@/features/studio/copy/layout-en";
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
  community: communityId,
  discover: discoverId,
  post: postId,
  compose: composeId,
  groups: groupsId,
  events: eventsId,
  studioLayout: studioLayoutId,
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
  community: communityEn,
  discover: discoverEn,
  post: postEn,
  compose: composeEn,
  groups: groupsEn,
  events: eventsEn,
  studioLayout: studioLayoutEn,
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
