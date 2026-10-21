import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/blog";
import { deletePostAction } from "@/app/admin/actions";
import ConfirmButton from "@/app/admin/ConfirmButton";
import PostEditor from "@/app/admin/posts/PostEditor";

export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const post = await getPostById(Number((await params).id));
  if (!post) notFound();

  return (
    <>
      <PostEditor
        key={post.id}
        justSaved={(await searchParams).saved === "1"}
        post={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          coverUrl: post.coverUrl,
          contentHtml: post.contentHtml,
          status: post.status,
        }}
      />
      <form action={deletePostAction} className="mx-auto mt-10 max-w-4xl border-t border-line pt-6">
        <input type="hidden" name="id" value={post.id} />
        <ConfirmButton
          message="Delete this post, its comments and its stats for good?"
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Delete this post
        </ConfirmButton>
      </form>
    </>
  );
}
