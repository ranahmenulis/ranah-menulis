"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { categoryLabel } from "@/features/projects/project-model";
import { projectCategories } from "@/features/projects/stored-projects";
import type { ProjectCategory, ProjectFixture } from "@/features/projects/types";
import { manageHref } from "../area-hrefs";
import { saveProject } from "../organizer-actions";
import {
  emptyInput,
  inputOf,
  isOpenService,
  takesSubmissions,
  type InputErrors,
  type ProjectInput,
} from "../project-input";
import { CategoryFields, TextField, ZoneSelect, type FormApi } from "./form-fields";

const ORDER: (keyof ProjectInput | "block")[] = [
  "title",
  "summary",
  "about",
  "requirements",
  "closesDate",
  "milestones",
  "feeIdr",
  "feeMyr",
  "quota",
  "minWords",
  "maxWorks",
  "block",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-t border-line pt-5">
      <legend className="pr-2 heading-sm">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Write a new draft or change a project written here (PRJ-03). Every failing rule shows at its
 * field and nothing typed is lost. Once there are participants the category, zone and prices are
 * fixed and the quota cannot drop below them. The clock is read when the button is pressed.
 */
export function ProjectForm({
  fixture,
  registrants,
}: {
  /** The project being changed; absent when writing a new one. */
  fixture?: ProjectFixture;
  registrants: number;
}) {
  const router = useRouter();
  const [input, setInput] = useState<ProjectInput>(() =>
    fixture ? inputOf(fixture) : emptyInput(),
  );
  const [errors, setErrors] = useState<InputErrors>({});
  const [said, setSaid] = useState("");
  const locked = registrants > 0;
  const api: FormApi = {
    input,
    errors,
    set: (key, value) => setInput((prev) => ({ ...prev, [key]: value })),
  };

  function pickCategory(category: ProjectCategory) {
    setInput({ ...emptyInput(category), title: input.title });
    setErrors({});
  }

  function submit() {
    const result = saveProject(input, fixture?.slug ?? null, Date.now());
    if (!result.ok) {
      setErrors(result.errors);
      setSaid("");
      const first = ORDER.find((key) => result.errors[key]);
      if (first) document.getElementById(`proyek-${first}`)?.focus();
      return;
    }
    setErrors({});
    if (!fixture) return router.push(manageHref(result.project.slug));
    setSaid(
      result.project.terms.version !== fixture.terms.version
        ? "Perubahan disimpan. Ketentuan baru dikabarkan ke peserta yang sudah terdaftar."
        : "Perubahan disimpan.",
    );
  }

  return (
    <form
      noValidate
      className="grid max-w-170 gap-6"
      aria-label={fixture ? "Ubah proyek" : "Proyek baru"}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {!fixture && (
        <Field
          id="proyek-category"
          label="Kategori"
          hint="Kategori tidak bisa diganti sesudah proyek dibuat."
        >
          <Select
            id="proyek-category"
            value={input.category}
            onChange={(e) => pickCategory(e.target.value as ProjectCategory)}
          >
            {projectCategories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {locked && (
        <Notice>
          Sudah ada {registrants} peserta, jadi zona waktu dan biaya tidak bisa diubah dan kuota
          tidak boleh di bawah jumlah itu. Mengubah ketentuan mengabari peserta.
        </Notice>
      )}

      <Section title="Dasar">
        <TextField api={api} name="title" label="Judul" />
        <TextField api={api} name="summary" label="Ringkasan" hint="Satu kalimat untuk katalog." />
        <TextField
          api={api}
          name="about"
          label="Deskripsi"
          rows={5}
          hint="Pisahkan paragraf dengan baris kosong."
        />
        <TextField
          api={api}
          name="requirements"
          label="Syarat naskah"
          rows={4}
          hint="Satu syarat per baris."
        />
      </Section>

      <Section title="Jadwal">
        <ZoneSelect api={api} disabled={locked} />
        {!isOpenService(input.category) && (
          <TextField api={api} name="closesDate" label="Tenggat pendaftaran" type="date" />
        )}
        <TextField
          api={api}
          name="milestones"
          label="Tahap dan tanggal"
          rows={3}
          optional={input.category !== "kelas"}
          hint="Satu per baris: nama tahap | yyyy-mm-dd."
        />
      </Section>

      {!isOpenService(input.category) && (
        <Section title="Biaya dan kuota">
          <TextField
            api={api}
            name="feeIdr"
            label="Biaya (rupiah)"
            optional
            disabled={locked}
            hint="Kosongkan bila gratis."
          />
          <TextField
            api={api}
            name="feeMyr"
            label="Biaya (ringgit)"
            optional
            disabled={locked}
            hint="Ditetapkan terpisah, tidak dikonversi."
          />
          <TextField
            api={api}
            name="quota"
            label="Kuota"
            optional
            hint="Kosongkan bila tanpa batas."
          />
        </Section>
      )}

      {takesSubmissions(input.category) && (
        <Section title="Aturan kiriman">
          <TextField api={api} name="minWords" label="Kata minimum" />
          <TextField api={api} name="maxWords" label="Kata maksimum" />
          <TextField api={api} name="maxWorks" label="Karya per peserta" />
        </Section>
      )}

      <Section title="Ketentuan khusus">
        <TextField
          api={api}
          name="special"
          label="Ketentuan tambahan"
          rows={3}
          optional
          hint="Satu per baris. Dua pernyataan baku (hak cipta dan publikasi) selalu ikut."
        />
      </Section>

      <CategoryFields api={api} />

      <div className="grid gap-3">
        <p role="status" className="min-h-5 text-sm">
          {said}
        </p>
        <Button type="submit" className="justify-self-start">
          {fixture ? "Simpan perubahan" : "Buat draf"}
        </Button>
      </div>
    </form>
  );
}
