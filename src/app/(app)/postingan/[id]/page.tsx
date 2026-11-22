import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { PostSkeleton } from "@/features/community/components/post/post-states";
import { PostView } from "@/features/community/components/post/post-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("post") };
}

async function PostRoute({ params }: Pick<PageProps<"/postingan/[id]">, "params">) {
  const { id } = await params;
  return <PostView postId={id} />;
}

/** Thin route: the post and its comments are read on this device by a client component. */
export default function Page({ params }: PageProps<"/postingan/[id]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostRoute params={params} />
    </Suspense>
  );
}
