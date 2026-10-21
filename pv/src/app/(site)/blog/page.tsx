import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { listPublishedPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { plainText } from "@/lib/sanitize";
import { readingMinutes } from "@/lib/slug";

export const metadata = {
  title: "Blog | Pastor Victor Akuwa",
  description: "Writings from Pastor Victor Akuwa on faith, the Word, and discipleship.",
};

export default async function BlogIndex() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="container-px pt-16 pb-12 sm:pt-24 sm:pb-16">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">Blog</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Words for the journey of faith.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Reflections, teachings, and notes from PV on knowing God deeply and living by His Word.
          </p>
        </Reveal>
      </section>

      {!featured && (
        <section className="container-px pb-28">
          <div className="border-t border-line pt-10">
            <p className="text-lg text-muted">The first post is on its way. Check back soon.</p>
          </div>
        </section>
      )}

      {featured && (
        <section className="container-px pb-16 sm:pb-20">
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="group grid gap-8 border-t border-line pt-10 md:grid-cols-[1.25fr_1fr] md:items-center md:gap-14">
              {featured.coverUrl ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-line">
                  <Image
                    src={featured.coverUrl}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-end rounded-2xl bg-foreground p-8 text-background">
                  <span className="text-sm font-semibold uppercase tracking-widest text-background/60">Latest</span>
                </div>
              )}
              <div>
                <p className="text-sm text-muted">
                  {featured.publishedAt && formatDate(featured.publishedAt)} &middot;{" "}
                  {readingMinutes(plainText(featured.contentHtml))} min read
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-4 text-lg leading-relaxed text-muted">{featured.excerpt}</p>
                )}
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold transition-[gap] group-hover:gap-3">
                  Read post <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <section className="container-px pb-24 sm:pb-32">
          <ul className="divide-y divide-line border-y border-line">
            {rest.map((post, i) => (
              <li key={post.id}>
                <Reveal delay={Math.min(i, 4) * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid gap-5 py-8 sm:grid-cols-[10rem_1fr_9rem] sm:items-center sm:gap-10"
                  >
                    <p className="text-sm text-muted">
                      {post.publishedAt && formatDate(post.publishedAt)}
                    </p>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-muted sm:text-2xl">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 leading-relaxed text-muted">{post.excerpt}</p>
                      )}
                    </div>
                    {post.coverUrl && (
                      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl bg-line sm:block">
                        <Image src={post.coverUrl} alt="" fill sizes="9rem" className="object-cover" />
                      </div>
                    )}
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
