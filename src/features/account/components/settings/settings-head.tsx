import type { CSSProperties } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { AccountProfile } from "../../account-store";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Who these settings belong to, set like the head of the public profile: a large photo or
 * initials, the name in serif, the username. It shows what is saved, not what is being typed, so
 * it never looks as if an unsaved change already took effect.
 */
export function SettingsHead({
  profile,
}: {
  profile: Pick<AccountProfile, "name" | "username" | "avatar">;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
      <span className="rm-pop block" style={step(0)}>
        <Avatar name={profile.name} src={profile.avatar} size={88} />
      </span>
      <div className="grid min-w-0 gap-1">
        <p
          className="rm-rise-in font-serif text-[30px] leading-[1.15] wrap-anywhere md:text-[40px]"
          style={step(-3)}
        >
          {profile.name}
        </p>
        {profile.username && (
          <p className="rm-rise-in text-sm wrap-anywhere text-ink-muted" style={step(-2)}>
            @{profile.username}
          </p>
        )}
      </div>
    </div>
  );
}
