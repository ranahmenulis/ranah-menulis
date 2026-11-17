import type { Metadata } from "next";
import { UsersView } from "@/features/kelola/admin/components/users-view";

export const metadata: Metadata = { title: "Pengguna dan role · Kelola · RanahMenulis" };

export default function Page() {
  return <UsersView />;
}
