import { authors } from "@/features/community/fixtures/authors";
import type { Locale } from "@/lib/i18n/config";
import { ME_ID, SETUP_ID } from "../identity";
import { adminCopy } from "./copy/admin-copy";

/**
 * The people the Admin screen manages [usulan]: the dummy Community authors, the signed-in account
 * among them. No real accounts are invented; real sign-up replaces this list.
 */
export type Person = { id: string; name: string; handle: string };

export const people: readonly Person[] = authors.map(({ id, name, handle }) => ({
  id,
  name,
  handle,
}));

const byId = new Map(people.map((p) => [p.id, p]));

export const personById = (id: string): Person | undefined => byId.get(id);

/** A name to show for an id: "(kamu)" marks the signed-in account; unknown ids are shown as is. */
export function personLabel(id: string, locale: Locale = "id"): string {
  const copy = adminCopy(locale);
  if (id === SETUP_ID) return copy.setup;
  const person = personById(id);
  if (!person) return id;
  return id === ME_ID ? `${person.name} (${copy.you})` : person.name;
}
