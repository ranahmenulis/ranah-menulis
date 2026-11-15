import { Dot } from "@/components/ui/dots";
import { cn } from "@/lib/cn";
import { parseDay, type Milestone } from "../../streak";

const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

/**
 * Milestones (STK-06). Reached and locked differ by dot fill and weight, not color. "Baru" appears
 * only on the day a milestone was reached. [konfirmasi] Q-10: the list itself.
 */
export function MilestoneList({ items, today }: { items: Milestone[]; today: string }) {
  return (
    <section aria-labelledby="ms-heading" className="grid content-start gap-2">
      <h2 id="ms-heading" className="heading-md">
        Milestone
      </h2>
      <ul className="grid grid-cols-[minmax(0,1fr)] border-t border-line">
        {items.map((m) => {
          const reached = m.achievedOn !== null;
          return (
            <li key={m.id} className="flex items-center gap-3 border-b border-line py-3">
              <Dot kind={reached ? "full" : "lock"} size={20} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-base", reached ? "font-medium" : "text-ink-muted")}>
                  {m.title}
                  {m.achievedOn === today && (
                    <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs font-normal">
                      Baru
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-muted">{m.hint}</p>
              </div>
              <span className="text-xs whitespace-nowrap text-ink-muted">
                {m.achievedOn ? date.format(parseDay(m.achievedOn)) : m.remaining}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
