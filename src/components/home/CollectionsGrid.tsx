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

/**
 * Featured = Renditja 1 (or the lowest sortOrder if none is exactly 1).
 * Full-width first row; remaining cards keep the compact grid.
 */
export function CollectionsGrid({ title, eyebrow, items }: CollectionsGridProps) {
  const ordered = [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
  );

  const featuredIndex = ordered.findIndex((item) => item.sortOrder === 1);
  const featured =
    featuredIndex >= 0 ? ordered[featuredIndex] : (ordered[0] ?? null);
  const rest = featured
    ? ordered.filter((item) => item.slug !== featured.slug)
    : [];

  return (
    <section className="bg-ivory py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-choco-soft">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-center font-display text-4xl text-choco sm:text-5xl">
          {title}
        </h2>

        <div className="mt-12 flex flex-col gap-5 sm:gap-6">
          {featured ? (
            <CollectionCard item={featured} featured />
          ) : null}

          {rest.length > 0 ? (
            <div
              className={cn(
                "grid gap-5 sm:gap-6",
                rest.length === 1 && "mx-auto w-full max-w-sm grid-cols-1",
                rest.length === 2 && "mx-auto w-full max-w-3xl grid-cols-1 sm:grid-cols-2",
                rest.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {rest.map((item) => (
                <CollectionCard key={item.slug} item={item} />
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
}: {
  item: CollectionGridItem;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/koleksioni/${item.slug}`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-lg border border-beige",
        "transition-transform duration-500 ease-out hover:-translate-y-1.5",
      )}
      style={
        featured
          ? { aspectRatio: "21 / 9", minHeight: 280 }
          : { aspectRatio: "3 / 4" }
      }
    >
      {item.imageSrc ? (
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
      ) : (
        <div className="absolute inset-0 bg-rose-soft" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent transition-opacity duration-500 group-hover:from-ink/70" />

      <span
        className={cn(
          "absolute bottom-6 left-6 font-display text-ivory",
          featured ? "text-3xl sm:text-4xl md:text-5xl" : "text-3xl",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
