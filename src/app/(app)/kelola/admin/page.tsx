import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { UsersView } from "@/features/kelola/admin/components/users-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("usersAndRoles", "manage") };
}

export default function Page() {
  return <UsersView />;
}
