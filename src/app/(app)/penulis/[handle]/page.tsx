import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/features/profile/components/profile-states";
import { ProfileView } from "@/features/profile/components/profile-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("authorProfile") };
}

async function ProfileRoute({ params }: Pick<PageProps<"/penulis/[handle]">, "params">) {
  const { handle } = await params;
  // Keyed by handle so the selected tab starts over when moving from one profile to another.
  return <ProfileView key={handle} handle={handle} />;
}

/** Thin route: the profile is read on this device by a client component, like the post page. */
export default function Page({ params }: PageProps<"/penulis/[handle]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileRoute params={params} />
    </Suspense>
  );
}
