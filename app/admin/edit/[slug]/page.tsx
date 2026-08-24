import { notFound } from "next/navigation";
import { PostEditor } from "../../PostEditor";
import { getPost } from "../../../lib/posts";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug, { includeDrafts: true });
  if (!post) notFound();
  return <PostEditor initial={post} isNew={false} />;
}
