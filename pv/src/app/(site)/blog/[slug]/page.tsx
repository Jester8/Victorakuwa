import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostReactions from "@/components/blog/PostReactions";
import ShareButtons from "@/components/blog/ShareButtons";
import Comments from "@/components/blog/Comments";
import { getPostReactions, getPublishedPost, listComments } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { plainText } from "@/lib/sanitize";
import { readingMinutes } from "@/lib/slug";
import { getVisitorId } from "@/lib/visitor";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return { title: "Post not found | Pastor Victor Akuwa" };
  return {
    title: `${post.title} | Pastor Victor Akuwa`,
    description: post.excerpt || plainText(post.contentHtml).slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
    twitter: { card: post.coverUrl ? "summary_large_image" : "summary" },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPublishedPost((await params).slug);
  if (!post) notFound();

  const visitorId = await getVisitorId();
  const [reactions, comments] = await Promise.all([
    getPostReactions(post.id, visitorId),
    listComments(post.id, visitorId),
  ]);
  const minutes = readingMinutes(plainText(post.contentHtml));

  return (
    <article className="pb-24 sm:pb-32">
      <header className="container-px pt-12 sm:pt-20">
        <div className="mx-auto max-w-[44rem]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} /> All posts
          </Link>
          <p className="mt-10 text-sm text-muted">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
            )}{" "}
            &middot; {minutes} min read
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-6 text-xl leading-relaxed text-muted">{post.excerpt}</p>
          )}
          <p className="mt-8 flex items-center gap-3 border-t border-line pt-6 text-sm">
            <span className="font-semibold">Pastor Victor Akuwa</span>
          </p>
        </div>
      </header>

      {post.coverUrl && (
        <div className="container-px mt-10 sm:mt-14">
          <div className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl bg-line">
            <Image
              src={post.coverUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="container-px mt-12 sm:mt-16">
        <div
          className="blog-prose mx-auto max-w-[44rem]"
          // Sanitised with an allow-list when the post is saved (src/lib/sanitize.ts).
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className="mx-auto mt-16 max-w-[44rem] space-y-8 border-t border-line pt-10">
          <PostReactions slug={post.slug} initial={reactions} />
          <ShareButtons slug={post.slug} title={post.title} />
        </div>

        <div className="mx-auto mt-16 max-w-[44rem]">
          <Comments slug={post.slug} initial={comments} />
        </div>
      </div>
    </article>
  );
}
