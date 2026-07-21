"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CollectionGridItem = {
  slug: string;
  label: string;
  imageSrc: string | null;
  unoptimized: boolean;
  sortOrder: number;
};

type CollectionsGridProps = {
  title: string;
  eyebrow: string;
  items: CollectionGridItem[];
};

/** Cards after the featured row: stable 2–3 column layout. */
function restGridClassName(count: number) {
  if (count <= 1) {
    return "mx-auto max-w-sm grid-cols-1";
  }
  if (count === 2) {
    return "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2";
  }
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

export function CollectionsGrid({ title, eyebrow, items }: CollectionsGridProps) {
  // Admin sortOrder asc — already ordered by getActiveCollections.
  const ordered = items;
  const featured =
    ordered.find((item) => item.sortOrder === 1) ?? ordered[0] ?? null;
  const rest = featured
    ? ordered.filter((item) => item.slug !== featured.slug)
    : [];

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

        <div className="mt-12 space-y-5 sm:space-y-6">
          {featured ? (
            <CollectionCard
              item={featured}
              featured
              index={0}
            />
          ) : null}

          {rest.length > 0 ? (
            <div className={cn("grid gap-5 sm:gap-6", restGridClassName(rest.length))}>
              {rest.map((item, index) => (
                <CollectionCard
                  key={item.slug}
                  item={item}
                  index={index + 1}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  item,
  featured = false,
  index,
}: {
  item: CollectionGridItem;
  featured?: boolean;
  index: number;
}) {
  return (
    <Link
      href={`/koleksioni/${item.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-beige",
        "animate-fade-rise transition-transform duration-500 ease-out",
        "hover:-translate-y-1.5",
        featured
          ? "aspect-video min-h-[240px] w-full sm:min-h-[320px] lg:min-h-[380px]"
          : "aspect-[3/4]",
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
              sizes={
                featured
                  ? "100vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              unoptimized={item.unoptimized}
              priority={featured}
            />
          </div>
        </div>
      ) : (
        <div className="h-full bg-rose-soft" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent transition-opacity duration-500 group-hover:from-ink/70" />

      <span
        className={cn(
          "absolute bottom-6 left-6 font-display text-ivory",
          "translate-y-1 transition-transform duration-500 ease-out",
          "group-hover:translate-y-0",
          featured ? "text-3xl sm:text-4xl md:text-5xl" : "text-3xl",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
