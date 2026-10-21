import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { books } from "@/data/books";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return books.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);

  if (!book) return { title: "Book not found | Pastor Victor Akuwa" };

  return {
    title: `${book.title} | Pastor Victor Akuwa`,
    description: book.description,
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);

  if (!book) notFound();

  return (
    <section className="container-px py-10 sm:py-14 lg:py-20">
      <Link
        href="/books#titles"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        <ArrowLeft size={16} />
        All books
      </Link>

      <div className="mt-8 grid items-start gap-10 md:mt-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16 lg:gap-24">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden bg-foreground/[0.03] p-4">
          <Image
            src={book.cover}
            alt={`${book.title} book cover`}
            fill
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-contain p-4"
          />
        </div>

        <div className="pt-2 md:pt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Book by Victor Akuwa
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {book.title}
          </h1>
          <div className="mt-8 h-px w-16 bg-foreground" />
          <h2 className="mt-8 text-xl font-bold tracking-tight">
            About this book
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {book.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              Click to purchase
              <ArrowUpRight size={16} />
            </a>
            {book.amazonHref && (
              <a
                href={book.amazonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold underline decoration-line underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
              >
                Also on Amazon
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
