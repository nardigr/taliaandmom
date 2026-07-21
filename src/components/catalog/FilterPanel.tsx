import Link from "next/link";
import {
  buildCatalogQueryString,
  type CatalogSearchParams,
} from "@/lib/catalog/filters";
import { COLORS, SIZES } from "@/lib/config";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  basePath: string;
  searchParams: CatalogSearchParams;
  collections?: { slug: string; label: string }[];
  showSeasonFilter?: boolean;
  fixedSeasonSlug?: string;
  activeSeasonSlug?: string;
  activeCategory?: string;
  activeSize?: string;
  activeColor?: string;
  onNavigate?: () => void;
};

export function FilterPanel({
  basePath,
  searchParams,
  collections = [],
  showSeasonFilter = false,
  fixedSeasonSlug,
  activeSeasonSlug,
  activeCategory,
  activeSize,
  activeColor,
  onNavigate,
}: FilterPanelProps) {
  const resetHref = `${basePath}${buildCatalogQueryString({}, {}, { fixedSeasonSlug })}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
          {t.filtro}
        </h2>
        <Link
          href={resetHref}
          onClick={onNavigate}
          className="text-xs uppercase tracking-wider text-choco-soft transition-colors hover:text-choco"
        >
          {t.pastroFiltrat}
        </Link>
      </div>

      {showSeasonFilter && (
        <FilterSection title={t.stina}>
          <FilterLink
            href={`${basePath}${buildCatalogQueryString(searchParams, { stina: undefined, faqe: undefined })}`}
            active={!activeSeasonSlug}
            label={t.teGjitha}
            onNavigate={onNavigate}
          />
          {collections.map((season) => (
            <FilterLink
              key={season.slug}
              href={`${basePath}${buildCatalogQueryString(searchParams, {
                stina: season.slug,
                faqe: undefined,
              })}`}
              active={activeSeasonSlug === season.slug}
              label={season.label}
              onNavigate={onNavigate}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title={t.madhesia}>
        {SIZES.map((size) => (
          <FilterLink
            key={size}
            href={`${basePath}${buildCatalogQueryString(searchParams, {
              madhesia: activeSize === size ? undefined : size,
              faqe: undefined,
            }, { fixedSeasonSlug })}`}
            active={activeSize === size}
            label={size}
            onNavigate={onNavigate}
          />
        ))}
      </FilterSection>

      <FilterSection title={t.ngjyra}>
        <div className="space-y-2">
          {COLORS.map((color) => (
            <Link
              key={color.key}
              href={`${basePath}${buildCatalogQueryString(searchParams, {
                ngjyra: activeColor === color.key ? undefined : color.key,
                faqe: undefined,
              }, { fixedSeasonSlug })}`}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-cream",
                activeColor === color.key && "bg-cream font-medium text-choco",
              )}
            >
              <ColorSwatch hex={color.hex} label={color.label} />
              {color.label}
            </Link>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs uppercase tracking-[0.25em] text-choco-soft">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function FilterLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "block rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-cream",
        active ? "bg-cream font-medium text-choco" : "text-ink",
      )}
    >
      {label}
    </Link>
  );
}

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  if (hex === "linear") {
    return (
      <span
        aria-hidden
        className="h-5 w-5 rounded-full border border-beige"
        style={{
          background:
            "conic-gradient(#EFC6C2, #D9C7B2, #2C3E70, #4E6E58, #EFC6C2)",
        }}
        title={label}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="h-5 w-5 rounded-full border border-beige"
      style={{ backgroundColor: hex }}
      title={label}
    />
  );
}
