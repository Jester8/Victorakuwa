import Image from "next/image";
import Reveal from "@/components/Reveal";

const photos = [
  {
    src: "/photos/IMG_8143.webp",
    alt: "Pastor Victor Akuwa standing beside his desk.",
    label: "Standing",
  },
  {
    src: "/photos/IMG_8139.webp",
    alt: "Portrait of Pastor Victor Akuwa seated at his desk.",
    label: "Seated",
  },
];

export default function PhotoGallery() {
  return (
    <section className="border-y border-line bg-background py-16 sm:py-20 lg:py-24">
      <div className="container-px">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Portraits
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Standing and seated.
          </h2>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-7">
          {photos.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 0.08}>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-foreground/5">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 44vw, 100vw"
                    className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="mt-3 text-sm font-semibold text-muted">
                  {photo.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
