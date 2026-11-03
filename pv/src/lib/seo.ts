import type { Metadata } from "next";

export const SITE_NAME = "Pastor Victor Akuwa";
export const SITE_DESCRIPTION =
  "Pastor Victor Akuwa is a teacher, author and mentor, Lead Pastor of The Prevailing House, raising people who know God deeply, live by His Word, and carry His influence into every sphere of society.";

// Set NEXT_PUBLIC_SITE_URL once the custom domain is live; until then Vercel's
// production domain is used so links in previews and the sitemap are absolute.
// Only used on the server, so it needs no NEXT_PUBLIC_ prefix. The old name still works.
export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type OgImage = { url: string; width?: number; height?: number; alt: string };

/** House-logo card used when a page has no image of its own. */
export const SITE_IMAGE: OgImage = {
  url: "/og/site.jpg",
  width: 1200,
  height: 630,
  alt: "The Prevailing House logo with the name Pastor Victor Akuwa",
};

/** Portrait card used for pages about PV himself. */
export const PV_IMAGE: OgImage = {
  url: "/og/pastor-victor.jpg",
  width: 1200,
  height: 630,
  alt: "Pastor Victor Akuwa",
};

export const PV_PHOTO = "/photos/IMG_8141.webp";

/**
 * A 1200x630 JPEG of any site or blog image, for link previews. Book covers and
 * uploads are WebP, which LinkedIn and some WhatsApp versions won't display.
 */
export function shareImage(src: string, alt: string): OgImage {
  return { url: `/share-image?src=${encodeURIComponent(src)}`, width: 1200, height: 630, alt };
}

export const SOCIAL_PROFILES = [
  "https://www.instagram.com/akuwavictor",
  "https://linktr.ee/vakuwa",
  "https://t.me/ThePrevailingHouse",
];

export const KEYWORDS = [
  "Pastor Victor Akuwa",
  "Victor Akuwa",
  "PV",
  "The Prevailing House",
  "Davidic Generation Church",
  "Ibadan pastor",
  "Nigerian pastor",
  "Christian author",
  "Christian books",
  "Bible teaching",
  "discipleship",
  "Dear Àṣàkẹ́",
  "Dear Ọba",
];

/**
 * Metadata for one page. Each page sets its own Open Graph block because Next
 * replaces (not merges) a parent's openGraph when a child defines one.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = SITE_IMAGE,
  type = "website",
  absoluteTitle = false,
  extra,
}: {
  title: string;
  description: string;
  path: string;
  image?: OgImage;
  type?: "website" | "article" | "profile" | "book";
  absoluteTitle?: boolean;
  extra?: Partial<NonNullable<Metadata["openGraph"]>>;
}): Metadata {
  // Don't repeat the name when the title already says it.
  const standalone = absoluteTitle || title.includes(SITE_NAME);
  const socialTitle = standalone ? title : `${title} | ${SITE_NAME}`;
  return {
    title: standalone ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      locale: "en_NG",
      title: socialTitle,
      description,
      images: [image],
      ...extra,
    } as Metadata["openGraph"],
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image.url],
    },
  };
}

export const personJsonLd = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Victor Akuwa",
  alternateName: ["Pastor Victor Akuwa", "PV"],
  honorificPrefix: "Pastor",
  url: SITE_URL,
  image: absoluteUrl(PV_PHOTO),
  jobTitle: "Lead Pastor",
  description: SITE_DESCRIPTION,
  worksFor: { "@type": "Organization", name: "The Prevailing House" },
  affiliation: { "@type": "Church", name: "Davidic Generation Church", address: "Ibadan, Nigeria" },
  knowsAbout: ["Bible teaching", "Christian discipleship", "Faith", "Mentorship"],
  sameAs: SOCIAL_PROFILES,
};
