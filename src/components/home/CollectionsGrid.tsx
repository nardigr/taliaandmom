"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type CollectionGridItem = {
  slug: string;
  label: string;
  imageSrc: string | null;
  unoptimized: boolean;
};

type CollectionsGridProps = {
  title: string;
  eyebrow: string;
  items: CollectionGridItem[];
};

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Responsive grid tuned to collection count so leftover cards don’t look stranded. */
function gridClassName(count: number) {
  if (count <= 1) {
    return "mx-auto max-w-sm grid-cols-1";
  }
  if (count === 2) {
    return "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2";
  }
  if (count === 3) {
    return "mx-auto max-w-5xl grid-cols-1 sm:grid-cols-3";
  }
  if (count === 4) {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  }
  if (count === 5) {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6";
  }
  // 6+
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

/** For 5 items on large screens: 3 on first row (2 cols each of 6), 2 centered on second. */
function cardSpanClass(count: number, index: number) {
  if (count !== 5) return undefined;
  // lg: 6-column grid — first three take 2 cols; last two take 2 cols and offset to center
  if (index < 3) return "lg:col-span-2";
  if (index === 3) return "lg:col-span-2 lg:col-start-2";
  return "lg:col-span-2";
}

export function CollectionsGrid({ title, eyebrow, items }: CollectionsGridProps) {
  const [ordered, setOrdered] = useState(items);

  useEffect(() => {
    setOrdered(shuffle(items));
  }, [items]);

  const count = ordered.length;

  return (
    <section className="bg-ivory py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-choco-soft animate-fade-rise">
          {eyebrow}
        </p>
        <h2
          className="mt-3 text-center font-display text-4xl text-choco animate-fade-rise sm:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          {title}
        </h2>

        <div className={cn("mt-12 grid gap-5 sm:gap-6", gridClassName(count))}>
          {ordered.map((item, index) => (
            <Link
              key={item.slug}
              href={`/koleksioni/${item.slug}`}
              className={cn(
                "group relative aspect-[3/4] overflow-hidden rounded-lg border border-beige",
                "animate-fade-rise transition-transform duration-500 ease-out",
                "hover:-translate-y-1.5",
                cardSpanClass(count, index),
              )}
              style={{ animationDelay: `${140 + index * 90}ms` }}
            >
              {item.imageSrc ? (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-[-10%] h-[120%] w-[120%] animate-ken-burns will-change-transform">
                    <Image
                      src={item.imageSrc}
                      alt={item.label}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      unoptimized={item.unoptimized}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full bg-rose-soft" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent transition-opacity duration-500 group-hover:from-ink/70" />

              <span
                className={cn(
                  "absolute bottom-6 left-6 font-display text-3xl text-ivory",
                  "translate-y-1 transition-transform duration-500 ease-out",
                  "group-hover:translate-y-0",
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
