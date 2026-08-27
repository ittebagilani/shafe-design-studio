import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "../../lib/posts";
import { PostView } from "../../components/PostView";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post
    ? { title: `${post.title} — SHAFE`, description: post.dek }
    : { title: "SHAFE" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const post = posts[index];
  const next = posts.length > 1 ? posts[(index + 1) % posts.length] : null;

  return (
    <PostView
      post={post}
      backHref="/blog"
      next={next ? { slug: next.slug, title: next.title } : undefined}
    />
  );
}
