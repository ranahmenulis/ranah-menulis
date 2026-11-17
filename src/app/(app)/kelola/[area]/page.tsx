import { notFound } from "next/navigation";
import { AREAS } from "@/features/kelola/access";
import { AreaPlaceholder } from "@/features/kelola/components/area-placeholder";

/** Fallback until an area gets its own route; specific routes added later take precedence. */
export default async function Page({ params }: PageProps<"/kelola/[area]">) {
  const { area } = await params;
  const info = AREAS.find((a) => a.id === area);
  if (!info) notFound();
  return <AreaPlaceholder area={info} />;
}
