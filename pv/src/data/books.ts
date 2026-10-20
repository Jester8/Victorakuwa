export type BookRelease = {
  slug: string;
  title: string;
  href: string;
  cover: string;
  description: string;
  latest?: boolean;
  amazonHref?: string;
};

export const books: BookRelease[] = [
  {
    slug: "dear-asake",
    title: "Dear Àṣàkẹ́",
    href: "https://selar.com/65746t29i9",
    cover: "/books/dear-asake.webp",
    description:
      "A collection of seventeen intimate, pastoral letters for young Nigerian women navigating identity, faith, purpose, and relationships. Grounded in Scripture, the book speaks to women seeking to live with conviction, dignity, and confidence in their calling.",
    latest: true,
  },
  {
    slug: "dear-oba",
    title: "Dear Ọba",
    href: "https://selar.com/dw600u1i53",
    cover: "/books/dear-oba.webp",
    description:
      "Seventeen direct and honest letters to Nigerian men about masculine identity, faith, and the pressures men often carry in silence. Written from the perspective of a father, brother, and pastor, it calls readers to step into the life and responsibility God has given them.",
    latest: true,
  },
  {
    slug: "wisdom-through-faith",
    title: "Wisdom Through Faith",
    href: "https://selar.com/9770e60ow6",
    cover: "/books/wisdom-through-faith.webp",
    description:
      "A practical look at how wisdom and faith work together in Christian living. The book explores wisdom as the application of God’s Word and faith as active trust in divine truth, with biblical insights for building a life that pleases God.",
  },
  {
    slug: "faith-god-kind",
    title: "Faith: Living by the God-Kind of Faith",
    href: "https://selar.com/2y1q6077n8",
    cover: "/books/faith-god-kind.webp",
    description:
      "A guide to moving beyond belief as an idea and living by faith in everyday life. It focuses on thinking, speaking, and acting in line with God’s Word, and on responding to doubt and fear with trust in His promises.",
  },
  {
    slug: "effective-study-of-gods-word",
    title: "Effective Study of God’s Word",
    href: "https://selar.co/s2de21",
    cover: "/books/effective-study-word.webp",
    description:
      "This book presents Scripture as the source of knowledge about God and helps readers approach the Bible with greater understanding. It addresses the difficulty many believers have interpreting Scripture and offers guidance for studying it effectively.",
  },
  {
    slug: "effective-study-of-gods-word-ii",
    title: "Effective Study of God’s Word II",
    href: "https://selar.co/601710",
    cover: "/books/effective-study-word-ii.webp",
    description:
      "A follow-up focused on intentional, accurate study of Scripture. It emphasizes learning how to study the Word well so readers can make the most of the knowledge available to them.",
  },
  {
    slug: "jehovah-rapha-the-god-who-heals",
    title: "Jehovah Rapha: The God Who Heals",
    href: "https://selar.co/0365c5",
    cover: "/books/jehovah-rapha.webp",
    description:
      "Drawing on Exodus 15:22–27 and the name Jehovah Rapha, this book explores God as the one who heals. Its subject reaches beyond physical healing to the spirit and soul, with a focus on experiencing healing through God’s Word.",
    amazonHref: "https://a.co/d/5S0KPMr",
  },
  {
    slug: "tribal-marks",
    title: "Tribal Marks",
    href: "https://selar.co/3pz5",
    cover: "/books/tribal-marks.webp",
    description:
      "A Christian book about the believer’s identity, privileges, and responsibilities as a son of God. It contrasts the values of the Christ-centered life with the values of the world and explains why understanding that identity matters.",
    amazonHref: "https://a.co/d/g1EBmK2",
  },
];

export const latestBooks = books.filter((book) => book.latest);
