import { Notice } from "@/components/ui/states";
import type { AreaInfo } from "../access";

/** Stands in for an area until its own screens exist (6g-1 onwards); the frame guards access. */
export function AreaPlaceholder({ area }: { area: AreaInfo }) {
  return (
    <section aria-labelledby="area-title" className="grid max-w-170 gap-4">
      <h1 id="area-title" className="heading-lg">
        {area.label}
      </h1>
      <p className="text-sm text-ink-muted">{area.summary}</p>
      <Notice>Bagian ini belum dibuka.</Notice>
    </section>
  );
}
