"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, endSession, requireAdmin, startSession } from "@/lib/auth";
import {
  deleteComment,
  deletePost,
  getPostById,
  saveCommentReply,
  savePost,
  setCommentHidden,
  setPostStatus,
  slugExists,
} from "@/lib/blog";
import { ADMIN_REPLY_MAX } from "@/lib/reactions";
import { plainText, sanitizePostHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { getActiveTheme, getThemeVersion, saveThemeVersion, THEME_TAG } from "@/lib/theme";
import { DEFAULT_THEME, parseTheme, sameTheme, type Theme } from "@/lib/theme-shared";

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
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.SESSION_SECRET) {
    return {
      error: "Admin login needs configuration. Set ADMIN_PASSWORD_HASH and SESSION_SECRET in your environment variables.",
      email,
    };
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
  revalidatePath("/admin/posts");
  // From the posts list, stay on the same filtered view; from the editor, go back to the list.
  const back = String(formData.get("back") ?? "");
  redirect(back.startsWith("/admin/posts") ? back : "/admin/posts");
}

export async function setPostStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") === "published" ? "published" : "draft";
  if (!Number.isInteger(id)) return;
  if (status === "published") {
    const post = await getPostById(id);
    // Same rule as the editor: an empty post can't go live.
    if (!post || !post.title.trim() || !plainText(post.contentHtml)) return;
  }
  const slug = await setPostStatus(id, status);
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
}

export async function setCommentHiddenAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const hidden = formData.get("hidden") === "true";
  if (Number.isInteger(id)) await setCommentHidden(id, hidden);
  revalidatePath("/admin/comments");
}

export async function saveCommentReplyAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const reply = String(formData.get("reply") ?? "").trim();
  if (!Number.isInteger(id) || id <= 0 || reply.length > ADMIN_REPLY_MAX) return;

  const slug = await saveCommentReply(id, reply);
  if (!slug) return;
  revalidatePath("/admin/comments");
  revalidatePath(`/blog/${slug}`);
}

export async function deleteCommentAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await deleteComment(id);
  revalidatePath("/admin/comments");
}

export type ThemeActionState = { error?: string; savedAt?: number; message?: string };

async function publishTheme(theme: Theme, label: string) {
  await saveThemeVersion(theme, label);
  updateTag(THEME_TAG);
  revalidatePath("/", "layout");
}

export async function saveThemeAction(_prev: ThemeActionState, formData: FormData): Promise<ThemeActionState> {
  await requireAdmin();
  let theme: Theme | null = null;
  try {
    theme = parseTheme(JSON.parse(String(formData.get("theme") ?? "")));
  } catch {}
  if (!theme) return { error: "Some theme settings were invalid. Reload the page and try again." };
  if (sameTheme(theme, await getActiveTheme())) return { error: "That's already the live theme." };
  const label = String(formData.get("label") ?? "").trim() || "Theme update";
  await publishTheme(theme, label);
  return { savedAt: Date.now(), message: "Published. The site now uses this theme." };
}

/** Restoring re-publishes an older version as the newest one, so the restore itself can be undone too. */
export async function restoreThemeAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (formData.get("original") === "true") {
    await publishTheme(DEFAULT_THEME, "Restored the original look");
  } else if (Number.isInteger(id)) {
    const version = await getThemeVersion(id);
    if (!version?.theme) return;
    await publishTheme(version.theme, `Restored: ${version.label || `version ${id}`}`);
  }
  revalidatePath("/admin/theme");
}
