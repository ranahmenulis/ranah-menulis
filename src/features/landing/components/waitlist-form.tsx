"use client";

import { useActionState, useRef, useState } from "react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { joinWaitlist } from "../waitlist/actions";
import { countries, initialWaitlistState } from "../waitlist/state";
import { waitlist } from "../copy";

/**
 * Form daftar tunggu: lima keadaan (kosong, mengirim, galat isian, galat kirim, sudah terdaftar)
 * dan sukses yang menggantikan form. Isian tidak pernah dihapus saat galat.
 * Papan: docs/desain/landing/FormStates.dc.html.
 */
export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initialWaitlistState);
  const [interests, setInterests] = useState<string[]>([]);
  const [dismissedFor, setDismissedFor] = useState<typeof state | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  if (state.status === "success") {
    const greet = state.values.name || "kamu";
    return (
      <div
        role="status"
        className="mt-10 grid content-start gap-4 md:col-span-6 md:col-start-7 md:mt-0"
      >
        <p className="font-serif text-[32px] leading-10 tracking-[-0.01em] text-balance">
          Terima kasih, {greet}. Namamu sudah tercatat.
        </p>
        <p className="text-base leading-6 text-ink-muted">
          Kabar pembukaan akan dikirim ke {state.values.email}.
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
      aria-label="Gabung daftar tunggu"
      className="mt-10 grid content-start gap-5 md:col-span-6 md:col-start-7 md:mt-0"
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
        <Field id="f-name" label="Nama panggilan" error={state.errors.name}>
          <Input
            id="f-name"
            name="name"
            autoComplete="nickname"
            placeholder="Misalnya Rinjani"
            defaultValue={state.values.name}
            readOnly={pending}
            aria-invalid={state.errors.name ? true : undefined}
            aria-describedby={describedBy("f-name", { error: state.errors.name })}
          />
        </Field>
        <Field id="f-email" label="Email" error={state.errors.email}>
          <Input
            id="f-email"
            name="email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder="nama@domain.com"
            defaultValue={state.values.email}
            readOnly={pending}
            aria-invalid={state.errors.email ? true : undefined}
            aria-describedby={describedBy("f-email", { error: state.errors.email })}
          />
        </Field>
      </div>

      <Field id="f-country" label="Negara">
        <Select
          id="f-country"
          name="country"
          defaultValue={state.values.country}
          disabled={pending}
        >
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium">
          Minat{" "}
          <span className="font-normal text-ink-muted">(opsional, boleh lebih dari satu)</span>
        </legend>
        <div role="group" aria-label="Minat" className="flex flex-wrap gap-2">
          {waitlist.interests.map((label) => (
            <Chip
              key={label}
              pressed={interests.includes(label)}
              disabled={pending}
              onClick={() =>
                setInterests((cur) =>
                  cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label],
                )
              }
            >
              {label}
            </Chip>
          ))}
        </div>
      </fieldset>

      {exists && (
        <p className="flex gap-2 text-sm text-ink" role="status">
          <Info size={16} aria-hidden className="mt-0.5 shrink-0" />
          Email ini sudah ada di daftar tunggu. Kamu tidak perlu mendaftar lagi; kabar pembukaan
          akan dikirim ke alamat ini.
        </p>
      )}

      {failed && (
        <ErrorBanner>
          Gagal mengirim karena koneksi terputus. Isianmu masih di sini; coba kirim lagi.
        </ErrorBanner>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="hero" loading={pending} className="min-w-62 max-md:w-full">
          {pending ? "Mengirim…" : failed ? "Coba kirim lagi" : "Gabung daftar tunggu"}
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
            Pakai email lain
          </Button>
        )}
      </div>

      <p className="text-xs text-ink-muted">
        Dengan bergabung, kamu menyetujui{" "}
        <a href="/kebijakan-privasi" className="text-ink underline underline-offset-3">
          Kebijakan privasi
        </a>{" "}
        RanahMenulis.
      </p>
    </form>
  );
}
