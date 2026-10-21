import { requireAdmin } from "@/lib/auth";
import PostEditor from "@/app/admin/posts/PostEditor";

export default async function NewPost() {
  await requireAdmin();
  return (
    <PostEditor
      post={{ slug: "", title: "", excerpt: "", coverUrl: null, contentHtml: "", status: "draft" }}
    />
  );
}
