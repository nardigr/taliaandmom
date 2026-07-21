/** Static catalog config. Seasons/collections are DB-driven via `Collection` model. */

export const CATEGORIES = [
  { key: "KOSTUME", slug: "kostume", label: "Kostume", seasons: "ALL" as const },
  { key: "FUSTANE", slug: "fustane", label: "Fustane", seasons: "ALL" as const },
  { key: "KEMISHA", slug: "kemisha", label: "Këmisha", seasons: "ALL" as const },
  { key: "PANTALLONA", slug: "pantallona", label: "Pantallona", seasons: "ALL" as const },
  { key: "XHAKETA", slug: "xhaketa", label: "Xhaketa", seasons: ["vjeshte"] as const },
  { key: "PALLTO", slug: "pallto", label: "Pallto", seasons: ["dimer"] as const },
] as const;

export const COLORS = [
  { key: "e-bardhe", label: "E bardhë", hex: "#FFFFFF" },
  { key: "e-zeze", label: "E zezë", hex: "#1A1A1A" },
  { key: "bezhe", label: "Bezhë", hex: "#D9C7B2" },
  { key: "krem", label: "Krem", hex: "#F3EBDD" },
  { key: "roze", label: "Rozë", hex: "#EFC6C2" },
  { key: "e-kuqe", label: "E kuqe", hex: "#B94A48" },
  { key: "bordo", label: "Bordo", hex: "#7B2D3B" },
  { key: "blu", label: "Blu", hex: "#2C3E70" },
  { key: "jeshile", label: "Jeshile", hex: "#4E6E58" },
  { key: "kafe", label: "Kafe", hex: "#6B4A3B" },
  { key: "gri", label: "Gri", hex: "#9AA0A6" },
  { key: "ari", label: "Ari", hex: "#C9A96A" },
  { key: "multikolor", label: "Multikolor", hex: "linear" },
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Një masë"] as const;

/** Default collections used for seeding / fallback labels */
export const DEFAULT_COLLECTIONS = [
  { slug: "pranvere", label: "Pranverë" },
  { slug: "vere", label: "Verë" },
  { slug: "vjeshte", label: "Vjeshtë" },
  { slug: "dimer", label: "Dimër" },
] as const;

/** Product.season stores collection slug */
export type SeasonKey = string;
export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export type ColorKey = (typeof COLORS)[number]["key"];

/** @deprecated Use getActiveCollections() — kept as empty for gradual migration */
export const SEASONS: { key: string; slug: string; label: string }[] = DEFAULT_COLLECTIONS.map(
  (item) => ({ key: item.slug, slug: item.slug, label: item.label }),
);

/** Default WhatsApp number until Settings are wired in Phase 1 */
export const PLACEHOLDER_WHATSAPP = "355000000000";
