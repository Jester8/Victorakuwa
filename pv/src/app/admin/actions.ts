"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, endSession, requireAdmin, startSession } from "@/lib/auth";
import {
  deleteComment,
  deletePost,
  savePost,
  setCommentHidden,
  slugExists,
} from "@/lib/blog";
import { plainText, sanitizePostHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";

export type ActionState = {
  error?: string;
  ok?: boolean;
  id?: number;
  savedAt?: number;
  email?: string;
};

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH || !process.env.SESSION_SECRET) {
    return { error: "Admin login isn't configured yet. See BLOG_SETUP.md.", email };
  }
  if (!(await checkCredentials(email, password))) {
    return { error: "That email and password don't match.", email };
  }
  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

export async function savePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim().slice(0, 300);
  const coverUrl = String(formData.get("coverUrl") ?? "").trim() || null;
  const status = formData.get("status") === "published" ? "published" : "draft";
  const contentHtml = sanitizePostHtml(String(formData.get("contentHtml") ?? ""));
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!title) return { error: "Add a title." };
  if (!slug) return { error: "Add a URL slug using letters or numbers." };
  if (status === "published" && !plainText(contentHtml)) {
    return { error: "Write something before publishing." };
  }
  if (coverUrl && !/^(https:\/\/|\/uploads\/)/.test(coverUrl)) {
    return { error: "The cover image link looks wrong. Upload it again." };
  }
  if (await slugExists(slug, id)) {
    return { error: `Another post already uses /blog/${slug}. Change the URL slug.` };
  }

  const savedId = await savePost({ id, slug, title, excerpt, coverUrl, contentHtml, status });
  if (!savedId) return { error: "This post no longer exists." };

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
  if (!id) redirect(`/admin/posts/${savedId}?saved=1`);
  return { ok: true, id: savedId, savedAt: Date.now() };
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await deletePost(id);
  revalidatePath("/blog");
  redirect("/admin/posts");
}

export async function setCommentHiddenAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const hidden = formData.get("hidden") === "true";
  if (Number.isInteger(id)) await setCommentHidden(id, hidden);
  revalidatePath("/admin/comments");
}

export async function deleteCommentAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await deleteComment(id);
  revalidatePath("/admin/comments");
}
