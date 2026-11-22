import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { UserView } from "@/features/kelola/admin/components/user-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("user", "manage"), robots: { index: false } };
}

/** Thin route: people and roles are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/admin/pengguna/[id]">) {
  const { id } = await params;
  return <UserView id={id} />;
}
