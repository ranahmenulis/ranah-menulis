"use client";

import { useActionState, useRef, useState } from "react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { joinWaitlist } from "../waitlist/actions";
import { countries, initialWaitlistState } from "../waitlist/state";
import { format, useT } from "@/lib/i18n/provider";
import { landing as landingId } from "../copy/id";

/**
 * Form daftar tunggu: lima keadaan (kosong, mengirim, galat isian, galat kirim, sudah terdaftar)
 * dan sukses yang menggantikan form. Isian tidak pernah dihapus saat galat.
 * Papan: docs/desain/landing/FormStates.dc.html.
 */
export function WaitlistForm() {
  const { form, interests: interestLabels } = useT().landing.waitlist;
  const [state, action, pending] = useActionState(joinWaitlist, initialWaitlistState);
  // Interests are stored by their Indonesian name whatever language the form is shown in.
  const [interests, setInterests] = useState<string[]>([]);
  const [dismissedFor, setDismissedFor] = useState<typeof state | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  if (state.status === "success") {
    const greet = state.values.name || form.fallbackName;
    return (
      <div
        role="status"
        className="grid content-start gap-4 transition-[opacity,translate] duration-520 ease-(--ease-out) starting:translate-y-2 starting:opacity-0"
      >
        <p className="text-[28px] leading-9 font-semibold tracking-[-0.02em] text-balance md:text-[32px] md:leading-10">
          {format(form.thanks, { name: greet })}
        </p>
        <p className="text-base leading-6 text-ink-muted">
          {format(form.confirmation, { email: state.values.email })}
        </p>
      </div>
    );
  }

  const exists = state.status === "exists" && dismissedFor !== state;
  const failed = state.status === "failed";

  return (
    <form
      action={action}
      noValidate
      aria-label={form.ariaLabel}
      className="grid content-start gap-5"
    >
      {/* Jebakan bot, tersembunyi dari manusia dan pembaca layar. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      {interests.map((i) => (
        <input key={i} type="hidden" name="interests" value={i} />
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="f-name" label={form.name} error={state.errors.name}>
          <Input
            id="f-name"
            name="name"
            autoComplete="nickname"
            placeholder={form.namePlaceholder}
            defaultValue={state.values.name}
            readOnly={pending}
            aria-invalid={state.errors.name ? true : undefined}
            aria-describedby={describedBy("f-name", { error: state.errors.name })}
          />
        </Field>
        <Field id="f-email" label={form.email} error={state.errors.email}>
          <Input
            id="f-email"
            name="email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder={form.emailPlaceholder}
            defaultValue={state.values.email}
            readOnly={pending}
            aria-invalid={state.errors.email ? true : undefined}
            aria-describedby={describedBy("f-email", { error: state.errors.email })}
          />
        </Field>
      </div>

      <Field id="f-country" label={form.country}>
        <Select
          id="f-country"
          name="country"
          defaultValue={state.values.country}
          disabled={pending}
        >
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {form.countries[c.value]}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium">
          {form.interest} <span className="font-normal text-ink-muted">{form.interestHint}</span>
        </legend>
        <div role="group" aria-label={form.interest} className="flex flex-wrap gap-2">
          {interestLabels.map((label, index) => {
            const value = landingId.waitlist.interests[index];
            return (
              <Chip
                key={value}
                pressed={interests.includes(value)}
                disabled={pending}
                onClick={() =>
                  setInterests((cur) =>
                    cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value],
                  )
                }
              >
                {label}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      {exists && (
        <p
          className="flex gap-2 text-sm text-ink transition-opacity duration-200 ease-(--ease-out) starting:opacity-0"
          role="status"
        >
          <Info size={16} aria-hidden className="mt-0.5 shrink-0" />
          {form.exists}
        </p>
      )}

      {failed && (
        <ErrorBanner className="transition-opacity duration-200 ease-(--ease-out) starting:opacity-0">
          {form.failed}
        </ErrorBanner>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          size="hero"
          loading={pending}
          className="lp-btn min-w-62 max-md:w-full"
        >
          {pending ? form.sending : failed ? form.retry : form.submit}
        </Button>
        {exists && (
          <Button
            variant="text"
            onClick={() => {
              setDismissedFor(state);
              if (emailRef.current) {
                emailRef.current.value = "";
                emailRef.current.focus();
              }
            }}
          >
            {form.otherEmail}
          </Button>
        )}
      </div>

      <p className="text-xs text-ink-muted">
        {form.consentBefore}{" "}
        <a href="/kebijakan-privasi" className="text-ink underline underline-offset-3">
          {form.privacy}
        </a>{" "}
        {form.consentAfter}
      </p>
    </form>
  );
}
