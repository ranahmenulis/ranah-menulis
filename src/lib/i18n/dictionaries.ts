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
import { projectsCatalog as projectsCatalogId } from "@/features/projects/copy/catalog-id";
import { projectsCatalog as projectsCatalogEn } from "@/features/projects/copy/catalog-en";
import { projectsFlow as projectsFlowId } from "@/features/projects/copy/flow-id";
import { projectsFlow as projectsFlowEn } from "@/features/projects/copy/flow-en";
import { projectsClass as projectsClassId } from "@/features/projects/copy/class-id";
import { projectsClass as projectsClassEn } from "@/features/projects/copy/class-en";
import { projectsContest as projectsContestId } from "@/features/projects/copy/contest-id";
import { projectsContest as projectsContestEn } from "@/features/projects/copy/contest-en";
import { projectsSolo as projectsSoloId } from "@/features/projects/copy/solo-id";
import { projectsSolo as projectsSoloEn } from "@/features/projects/copy/solo-en";
import { studioBook as studioBookId } from "@/features/studio/copy/book-id";
import { studioImport as studioImportId } from "@/features/studio/copy/import-id";
import { studioImport as studioImportEn } from "@/features/studio/copy/import-en";
import { studioWork as studioWorkId } from "@/features/studio/copy/work-id";
import { studioBook as studioBookEn } from "@/features/studio/copy/book-en";
import { studioWork as studioWorkEn } from "@/features/studio/copy/work-en";
import { studioLayout as studioLayoutId } from "@/features/studio/copy/layout-id";
import { studioLayout as studioLayoutEn } from "@/features/studio/copy/layout-en";
import { studioEditor as studioEditorId } from "@/features/studio/copy/editor-id";
import { studioEditor as studioEditorEn } from "@/features/studio/copy/editor-en";
import { studioStreak as studioStreakId } from "@/features/studio/copy/streak-id";
import { studioStreak as studioStreakEn } from "@/features/studio/copy/streak-en";
import { studioStats as studioStatsId } from "@/features/studio/copy/stats-id";
import { studioStats as studioStatsEn } from "@/features/studio/copy/stats-en";
import { studioDocuments as studioDocumentsId } from "@/features/studio/copy/documents-id";
import { studioDocuments as studioDocumentsEn } from "@/features/studio/copy/documents-en";
import { studioSearch as studioSearchId } from "@/features/studio/copy/documents-search-id";
import { studioSearch as studioSearchEn } from "@/features/studio/copy/documents-search-en";
import { profile as profileId } from "@/features/profile/copy/id";
import { profile as profileEn } from "@/features/profile/copy/en";
import { kelolaShared as kelolaSharedId } from "@/features/kelola/copy/shared-id";
import { kelolaShared as kelolaSharedEn } from "@/features/kelola/copy/shared-en";
import { kelolaEditor as kelolaEditorId } from "@/features/kelola/editor/copy/id";
import { kelolaEditor as kelolaEditorEn } from "@/features/kelola/editor/copy/en";
import { kelolaMentor as kelolaMentorId } from "@/features/kelola/mentor/copy/id";
import { kelolaMentor as kelolaMentorEn } from "@/features/kelola/mentor/copy/en";
import { kelolaOrganizer as kelolaOrganizerId } from "@/features/kelola/organizer/copy/id";
import { kelolaOrganizer as kelolaOrganizerEn } from "@/features/kelola/organizer/copy/en";
import { kelolaOrganizerTabs as kelolaOrganizerTabsId } from "@/features/kelola/organizer/copy/tabs-id";
import { kelolaOrganizerTabs as kelolaOrganizerTabsEn } from "@/features/kelola/organizer/copy/tabs-en";
import { kelolaOrganizerEvents as kelolaOrganizerEventsId } from "@/features/kelola/organizer/events/copy-id";
import { kelolaOrganizerEvents as kelolaOrganizerEventsEn } from "@/features/kelola/organizer/events/copy-en";
import { kelolaJuri as kelolaJuriId } from "@/features/kelola/juri/copy/id";
import { kelolaJuri as kelolaJuriEn } from "@/features/kelola/juri/copy/en";
import { kelolaAudit as kelolaAuditId } from "@/features/kelola/audit/copy/id";
import { kelolaAudit as kelolaAuditEn } from "@/features/kelola/audit/copy/en";
import { kelolaAdmin as kelolaAdminId } from "@/features/kelola/admin/copy/id";
import { kelolaAdmin as kelolaAdminEn } from "@/features/kelola/admin/copy/en";
import { kelolaModeration as kelolaModerationId } from "@/features/kelola/admin/copy/moderation-id";
import { support as supportId } from "@/features/support/copy/support-id";
import { kelolaModeration as kelolaModerationEn } from "@/features/kelola/admin/copy/moderation-en";
import { support as supportEn } from "@/features/support/copy/support-en";

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
  studioBook: studioBookId,
  studioImport: studioImportId,
  studioWork: studioWorkId,
  studioEditor: studioEditorId,
  studioStreak: studioStreakId,
  studioStats: studioStatsId,
  studioDocuments: studioDocumentsId,
  studioSearch: studioSearchId,
  projectsCatalog: projectsCatalogId,
  projectsFlow: projectsFlowId,
  projectsClass: projectsClassId,
  projectsContest: projectsContestId,
  projectsSolo: projectsSoloId,
  kelolaShared: kelolaSharedId,
  kelolaEditor: kelolaEditorId,
  kelolaMentor: kelolaMentorId,
  kelolaOrganizer: kelolaOrganizerId,
  kelolaOrganizerTabs: kelolaOrganizerTabsId,
  kelolaOrganizerEvents: kelolaOrganizerEventsId,
  kelolaJuri: kelolaJuriId,
  kelolaAudit: kelolaAuditId,
  kelolaAdmin: kelolaAdminId,
  kelolaModeration: kelolaModerationId,
  support: supportId,
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
  studioBook: studioBookEn,
  studioImport: studioImportEn,
  studioWork: studioWorkEn,
  studioEditor: studioEditorEn,
  studioStreak: studioStreakEn,
  studioStats: studioStatsEn,
  studioDocuments: studioDocumentsEn,
  studioSearch: studioSearchEn,
  projectsCatalog: projectsCatalogEn,
  projectsFlow: projectsFlowEn,
  projectsClass: projectsClassEn,
  projectsContest: projectsContestEn,
  projectsSolo: projectsSoloEn,
  kelolaShared: kelolaSharedEn,
  kelolaEditor: kelolaEditorEn,
  kelolaMentor: kelolaMentorEn,
  kelolaOrganizer: kelolaOrganizerEn,
  kelolaOrganizerTabs: kelolaOrganizerTabsEn,
  kelolaOrganizerEvents: kelolaOrganizerEventsEn,
  kelolaJuri: kelolaJuriEn,
  kelolaAudit: kelolaAuditEn,
  kelolaAdmin: kelolaAdminEn,
  kelolaModeration: kelolaModerationEn,
  support: supportEn,
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
