import { Check } from "@phosphor-icons/react/dist/ssr";
import { CheckChoice } from "@/components/ui/choice";
import { Notice } from "@/components/ui/states";
import { ExternalLink } from "./external-link";
import { Section } from "../../components/category-blocks";
import { formatProjectDate } from "../../project-model";
import type { TimeZoneName } from "../../types";
import { setMaterialDone } from "../material-progress";
import type { ClassContent, ClassMaterial } from "../types";

function Material({
  slug,
  material,
  done,
}: {
  slug: string;
  material: ClassMaterial;
  done: boolean;
}) {
  return (
    <details className="group border-b border-line py-3">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <span className="min-w-0 text-base font-medium wrap-anywhere">{material.title}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-ink-muted">
          {done && (
            <span className="flex items-center gap-1 text-ink">
              <Check size={14} aria-hidden />
              Selesai
            </span>
          )}
          {material.minutes} mnt
        </span>
      </summary>
      <div className="grid gap-3 pt-3">
        {material.body.map((paragraph, i) => (
          <p key={i} className="text-base wrap-anywhere">
            {paragraph}
          </p>
        ))}
        {material.url && <ExternalLink href={material.url}>Buka rekaman</ExternalLink>}
        <CheckChoice
          checked={done}
          onChange={(e) => setMaterialDone(slug, material.id, e.target.checked)}
          label="Tandai selesai"
        />
      </div>
    </details>
  );
}

/**
 * Materials of each module (KLS-02). They open only for a registered reader, which the dashboard
 * already guarantees; before the class starts they stay shut and say when they open.
 */
export function ClassMaterials({
  content,
  done,
  started,
  zone,
}: {
  content: ClassContent;
  done: ReadonlySet<string>;
  started: boolean;
  zone: TimeZoneName;
}) {
  return (
    <Section title="Materi">
      {!started ? (
        <Notice>
          Materi dibuka saat kelas dimulai pada {formatProjectDate(content.startsAt, zone)}.
        </Notice>
      ) : (
        content.modules.map((m) => (
          <div key={m.title} className="grid gap-1">
            <h3 className="text-sm font-medium wrap-anywhere text-ink-muted">{m.title}</h3>
            {m.materials.length === 0 ? (
              <p className="text-sm text-ink-muted">Belum ada materi di modul ini.</p>
            ) : (
              m.materials.map((material) => (
                <Material
                  key={material.id}
                  slug={content.slug}
                  material={material}
                  done={done.has(material.id)}
                />
              ))
            )}
          </div>
        ))
      )}
    </Section>
  );
}
