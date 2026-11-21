"use client";

import { Chip } from "@/components/ui/chip";
import { RadioChoice } from "@/components/ui/choice";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { GENRES, type Genre } from "@/features/community/types";
import { format, useT } from "@/lib/i18n/provider";
import { usernameTaken } from "../dummy-auth";
import { profileFieldId, type ProfileForm } from "../hooks/use-profile-form";
import { useDeviceTimeZone } from "../hooks/use-device-time-zone";
import { COUNTRIES, zoneOptions } from "../timezones";
import { BIO_MAX, NAME_MAX, normalizeUsername, USERNAME_MAX } from "../validation";
import { PhotoPicker } from "./photo-picker";

type Props = {
  form: ProfileForm;
  /** The username the reader already has: it is not "taken" for them, and it is not "new". */
  ownUsername?: string;
  /** Settings shows the photo in its head instead, so it passes false. */
  photo?: boolean;
};

/**
 * The profile fields (PLT-02): photo, name, username, bio, country, time zone, genres. Used by
 * onboarding and by Settings; the screen supplies the heading, the form tag, and the button.
 */
export function ProfileFields({ form, ownUsername, photo = true }: Props) {
  const t = useT().account;
  const device = useDeviceTimeZone();
  const { values, set, touch, issueOf } = form;

  const nameError = issueOf("name");
  const usernameError = issueOf("username");
  const bioError = issueOf("bio");
  const username = normalizeUsername(values.username);
  const usernameFree =
    !usernameError && username !== "" && username !== ownUsername && !usernameTaken(username);

  const toggleGenre = (genre: Genre) =>
    set({
      genres: values.genres.includes(genre)
        ? values.genres.filter((g) => g !== genre)
        : GENRES.filter((g) => g === genre || values.genres.includes(g)),
    });

  const zoneLabel = (zone: string) =>
    zone in t.zones && zone !== "other"
      ? t.zones[zone as keyof typeof t.zones]
      : format(t.zones.other, { zone });

  return (
    <div className="grid gap-6">
      {photo && <PhotoPicker form={form} />}

      <Field
        id={profileFieldId("name")}
        label={t.fields.name}
        error={nameError && t.errors[nameError]}
      >
        <Input
          id={profileFieldId("name")}
          name="name"
          autoComplete="name"
          value={values.name}
          maxLength={NAME_MAX * 2}
          onChange={(event) => set({ name: event.target.value })}
          onBlur={() => touch("name")}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={describedBy(profileFieldId("name"), { error: nameError })}
        />
      </Field>

      <Field
        id={profileFieldId("username")}
        label={t.fields.username}
        hint={t.fields.usernameHint}
        error={usernameError && t.errors[usernameError]}
        success={usernameFree ? t.fields.usernameFree : undefined}
      >
        <Input
          id={profileFieldId("username")}
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={values.username}
          maxLength={USERNAME_MAX * 2}
          onChange={(event) => set({ username: event.target.value })}
          onBlur={() => touch("username")}
          aria-invalid={usernameError ? true : undefined}
          aria-describedby={describedBy(profileFieldId("username"), {
            hint: t.fields.usernameHint,
            error: usernameError,
          })}
        />
      </Field>

      <Field
        id={profileFieldId("bio")}
        label={t.fields.bio}
        optional
        hint={format(t.fields.bioHint, { count: String(Array.from(values.bio.trim()).length) })}
        error={bioError && t.errors[bioError]}
      >
        <Textarea
          id={profileFieldId("bio")}
          name="bio"
          rows={3}
          value={values.bio}
          maxLength={BIO_MAX * 2}
          onChange={(event) => set({ bio: event.target.value })}
          onBlur={() => touch("bio")}
          aria-invalid={bioError ? true : undefined}
          aria-describedby={describedBy(profileFieldId("bio"), {
            hint: true,
            error: bioError,
          })}
        />
      </Field>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">{t.fields.country}</legend>
        {COUNTRIES.map((country) => (
          <RadioChoice
            key={country}
            name="country"
            label={t.countries[country]}
            checked={values.country === country}
            onChange={() => set({ country })}
          />
        ))}
      </fieldset>

      <Field id="profile-zone" label={t.fields.timeZone} hint={t.fields.timeZoneHint}>
        <Select
          id="profile-zone"
          name="timeZone"
          value={values.timeZone}
          onChange={(event) => set({ timeZone: event.target.value })}
          aria-describedby="profile-zone-hint"
        >
          {zoneOptions(values.timeZone, device).map((zone) => (
            <option key={zone} value={zone}>
              {zoneLabel(zone)}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">
          {t.fields.genres} <span className="font-normal text-ink-muted">{t.fields.optional}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Chip
              key={genre}
              pressed={values.genres.includes(genre)}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
