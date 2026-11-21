import type { CSSProperties } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { AccountProfile } from "../../account-store";
import type { ProfileForm } from "../../hooks/use-profile-form";
import { PhotoControls } from "../photo-picker";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Who these settings belong to, set like the head of the public profile: a large photo, the name in
 * serif, the username, and the photo controls. The photo is the form's own, so a newly chosen one
 * shows here at once and is kept by "Simpan perubahan"; the name and username are the saved ones.
 */
export function SettingsHead({
  profile,
  form,
}: {
  profile: Pick<AccountProfile, "name" | "username">;
  form: ProfileForm;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 sm:items-center">
      <span className="rm-pop block" style={step(0)}>
        <Avatar name={profile.name} src={form.values.avatar} size={88} />
      </span>
      <div className="grid min-w-0 gap-3">
        <div className="grid gap-1">
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
        <div className="rm-rise-in" style={step(-1)}>
          <PhotoControls form={form} />
        </div>
      </div>
    </div>
  );
}
