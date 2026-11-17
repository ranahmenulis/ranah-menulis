import type { Metadata } from "next";
import { UserView } from "@/features/kelola/admin/components/user-view";

export const metadata: Metadata = {
  title: "Pengguna · Kelola · RanahMenulis",
  robots: { index: false },
};

/** Thin route: people and roles are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/admin/pengguna/[id]">) {
  const { id } = await params;
  return <UserView id={id} />;
}
