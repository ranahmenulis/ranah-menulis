"use client";

import { useCallback, useMemo, useState } from "react";
import type { AccountProfile } from "../account-store";
import { fileToAvatar } from "../avatar-image";
import { usernameTaken } from "../reserved-usernames";
import { profileIssues, type ProfileField } from "../profile-validation";
import { photoIssue, type Issue } from "../validation";

const ORDER: ProfileField[] = ["name", "username", "bio"];

/** DOM id of each profile input, used to move focus to the first mistake. */
export const profileFieldId = (field: ProfileField) => `profile-${field}`;

/**
 * State of the profile form shared by onboarding and Settings. A mistake shows once the field was
 * left or the form was submitted, and then follows what is typed. `ownUsername` is the name the
 * reader already has, which does not count as taken.
 */
export function useProfileForm(initial: AccountProfile, ownUsername?: string) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<ReadonlySet<ProfileField>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState<Issue | null>(null);
  // A username the server refused as taken; it counts as a mistake until the reader changes it.
  const [refused, setRefused] = useState<string | null>(null);

  const taken = useCallback((name: string) => usernameTaken(name, ownUsername), [ownUsername]);
  const issues = useMemo(() => profileIssues(values, taken), [values, taken]);

  const issueOf = (field: ProfileField): Issue | null => {
    if (
      field === "username" &&
      refused !== null &&
      refused === values.username.trim().toLowerCase()
    ) {
      return "usernameTaken";
    }
    return submitted || touched.has(field) ? (issues[field] ?? null) : null;
  };

  const set = (patch: Partial<AccountProfile>) => setValues((v) => ({ ...v, ...patch }));
  const touch = (field: ProfileField) => setTouched((prev) => new Set(prev).add(field));

  /** Marks the form submitted; false (and focus on the first mistake) when something is wrong. */
  function validate(): boolean {
    setSubmitted(true);
    const first = ORDER.find((field) => issues[field]);
    if (first) document.getElementById(profileFieldId(first))?.focus();
    return !first;
  }

  /** The server found the username taken (someone else saved it first): show it on the field. */
  function refuseUsername() {
    setRefused(values.username.trim().toLowerCase());
    document.getElementById(profileFieldId("username"))?.focus();
  }

  async function choosePhoto(file: File) {
    const problem = photoIssue(file);
    if (problem) return setPhotoError(problem);
    try {
      set({ avatar: await fileToAvatar(file) });
      setPhotoError(null);
    } catch {
      setPhotoError("photoType");
    }
  }

  function removePhoto() {
    set({ avatar: null });
    setPhotoError(null);
  }

  return {
    values,
    set,
    touch,
    issueOf,
    validate,
    refuseUsername,
    photoError,
    choosePhoto,
    removePhoto,
  };
}

export type ProfileForm = ReturnType<typeof useProfileForm>;
