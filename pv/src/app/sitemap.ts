import type { MetadataRoute } from "next";
import { books } from "@/data/books";
import { listPublishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/books`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/teachings`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    ...books.map((book) => ({
      url: `${SITE_URL}/books/${book.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [`${SITE_URL}${book.cover}`],
    })),
  ];

  // The site's static pages are still listed if the database is unreachable.
  const posts = await listPublishedPosts().catch(() => []);
  return [
    ...pages,
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: post.coverUrl ? [post.coverUrl.startsWith("http") ? post.coverUrl : `${SITE_URL}${post.coverUrl}`] : undefined,
    })),
  ];
}
