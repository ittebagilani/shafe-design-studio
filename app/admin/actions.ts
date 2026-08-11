"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut, isAuthed } from "../lib/admin-auth";
import { saveBlobPost, deleteBlobPost, uploadImage } from "../lib/blob-posts";
import type { Post } from "../lib/posts";

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Unauthorized");
}

export async function loginAction(_prev: string | null, formData: FormData) {
  const ok = await signIn(String(formData.get("password") ?? ""));
  if (!ok) return "Incorrect password.";
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin");
}

export async function uploadAction(formData: FormData): Promise<string> {
  await requireAuth();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("No file provided.");
  return uploadImage(file);
}

export async function savePostAction(post: Post) {
  await requireAuth();
  if (!post.slug || !post.title.trim()) throw new Error("A title is required.");
  await saveBlobPost(post);
  updateTag("posts");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin");
}

export async function deletePostAction(slug: string) {
  await requireAuth();
  await deleteBlobPost(slug);
  updateTag("posts");
  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin");
}
