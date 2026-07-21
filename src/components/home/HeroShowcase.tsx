"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  href: string;
  name: string;
  imagePath: string;
  imageAlt: string;
};

type HeroShowcaseProps = {
  slides: HeroSlide[];
  backgroundImage?: string | null;
};

export function HeroShowcase({ slides, backgroundImage }: HeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeHref = hasSlides ? slides[index]?.href ?? "/koleksioni" : "/koleksioni";

  return (
    <section className="bg-ivory px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5 lg:px-8">
      <div className="relative mx-auto w-full max-w-[1400px] overflow-hidden bg-cream">
        <div className="relative aspect-[16/9] w-full sm:aspect-[2/1] lg:aspect-[2.4/1] lg:min-h-[480px]">
          {hasSlides ? (
            slides.map((slide, slideIndex) => (
              <Link
                key={slide.id}
                href={slide.href}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-out",
                  slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                aria-hidden={slideIndex !== index}
                tabIndex={slideIndex === index ? 0 : -1}
              >
                <Image
                  src={getProductImageUrl(slide.imagePath)}
                  alt={slide.imageAlt || slide.name}
                  fill
                  priority={slideIndex === 0}
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  className="object-cover"
                  unoptimized={
                    !slide.imagePath.startsWith("http://") &&
                    !slide.imagePath.startsWith("https://")
                  }
                />
              </Link>
            ))
          ) : (
            <Link
              href={activeHref}
              className="absolute inset-0 block bg-gradient-to-br from-ivory via-cream to-rose-soft"
              style={
                backgroundImage
                  ? {
                      backgroundImage: `url(${backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
          )}

          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={() =>
                  setIndex((current) => (current - 1 + slides.length) % slides.length)
                }
                className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-ivory/35 bg-ink/15 text-xl text-ivory backdrop-blur-sm transition-colors hover:bg-ink/35 sm:left-4 sm:h-11 sm:w-11"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setIndex((current) => (current + 1) % slides.length)}
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-ivory/35 bg-ink/15 text-xl text-ivory backdrop-blur-sm transition-colors hover:bg-ink/35 sm:right-4 sm:h-11 sm:w-11"
              >
                ›
              </button>

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-5">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={slide.name}
                    aria-current={slideIndex === index}
                    onClick={() => setIndex(slideIndex)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      slideIndex === index
                        ? "w-6 bg-ivory"
                        : "w-2 bg-ivory/45 hover:bg-ivory/75",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
