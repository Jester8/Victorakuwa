import Image from "next/image";
import Reveal from "@/components/Reveal";

const photos = [
  {
    src: "/photos/IMG_8132.webp",
    alt: "Pastor Victor Akuwa writing in a notebook at his desk.",
  },
  {
    src: "/photos/IMG_8135.webp",
    alt: "Pastor Victor Akuwa writing at his desk.",
  },
  {
    src: "/photos/IMG_8137.webp",
    alt: "Pastor Victor Akuwa looking down at a notebook while seated at his desk.",
  },
  {
    src: "/photos/IMG_8138.webp",
    alt: "Pastor Victor Akuwa seated at his desk with one hand at his chin.",
  },
  {
    src: "/photos/IMG_8139.webp",
    alt: "Portrait of Pastor Victor Akuwa seated at his desk.",
  },
  {
    src: "/photos/IMG_8141.webp",
    alt: "Pastor Victor Akuwa holding a pen at his desk.",
  },
  {
    src: "/photos/IMG_8143.webp",
    alt: "Pastor Victor Akuwa looking to the side from his desk.",
  },
  {
    src: "/photos/IMG_8146.webp",
    alt: "Pastor Victor Akuwa leaning over a table.",
  },
];

export default function PhotoGallery() {
  return (
    <section className="border-y border-line bg-background py-16 sm:py-20 lg:py-24">
      <div className="container-px">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            At the desk
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Making room for study, reflection, and the work of writing.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <Reveal key={photo.src} delay={(index % 4) * 0.06}>
              <figure className="relative aspect-[4/5] overflow-hidden rounded-xl bg-foreground/5">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 46vw"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
