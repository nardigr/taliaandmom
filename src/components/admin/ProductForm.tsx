"use client";

import { useRouter } from "next/navigation";
import { useActionState, useMemo, useState, startTransition } from "react";
import { Category } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import {
  deleteProductAction,
  saveProductAction,
  type AdminActionState,
} from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/slug";
import { getCategoriesForSeason } from "@/lib/catalog/filters";
import { COLORS, SIZES, type SeasonKey } from "@/lib/config";
import type { CollectionItem } from "@/lib/collections";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type ProductImageInput = {
  id?: string;
  path: string;
  alt: string;
  sortOrder: number;
};

type ProductFormProps = {
  collections: CollectionItem[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    compareAtCents: number | null;
    season: string;
    category: Category;
    color: string;
    sizes: string[];
    inStock: boolean;
    featured: boolean;
    images: ProductImageInput[];
  };
  defaultSeason?: string;
  defaultCategory?: Category;
};

const initialState: AdminActionState = {};

export function ProductForm({
  collections,
  product,
  defaultSeason,
  defaultCategory,
}: ProductFormProps) {
  const router = useRouter();
  const boundAction = saveProductAction.bind(null, product?.id ?? null);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const fallbackSeason = collections[0]?.slug ?? "pranvere";
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [priceEuros, setPriceEuros] = useState(
    product ? (product.priceCents / 100).toFixed(2) : "",
  );
  const [compareAtEuros, setCompareAtEuros] = useState(
    product?.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : "",
  );
  const [season, setSeason] = useState(
    product?.season ?? defaultSeason ?? fallbackSeason,
  );
  const [category, setCategory] = useState<Category>(
    product?.category ?? defaultCategory ?? Category.FUSTANE,
  );
  const [color, setColor] = useState(product?.color ?? COLORS[0].key);
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<ProductImageInput[]>(
    product?.images ?? [],
  );
  const [uploading, setUploading] = useState(false);

  const allowedCategories = useMemo(
    () => getCategoriesForSeason(season as SeasonKey),
    [season],
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!product) {
      setSlug(slugify(value));
    }
  }

  function toggleSize(size: string) {
    setSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size],
    );
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) return;

    const data = (await response.json()) as { path: string };
    setImages((current) => [
      ...current,
      {
        path: data.path,
        alt: name || t.emriProduktit,
        sortOrder: current.length,
      },
    ]);
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((image, sortOrder) => ({ ...image, sortOrder }));
    });
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("priceCents", String(Math.round(Number(priceEuros) * 100)));
    formData.set(
      "compareAtCents",
      compareAtEuros ? String(Math.round(Number(compareAtEuros) * 100)) : "",
    );
    formData.set("season", season);
    formData.set("category", category);
    formData.set("color", color);
    sizes.forEach((size) => formData.append("sizes", size));
    formData.set("inStock", String(inStock));
    formData.set("featured", String(featured));
    formData.set("images", JSON.stringify(images));
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <div className="space-y-8">
    <form id="product-edit-form" onSubmit={submitForm} className="space-y-8">
      {state.error && (
        <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Field label={t.emriProduktit}>
          <input
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label={t.slug}>
          <input
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            className={inputClass}
            required
          />
        </Field>
      </div>

      <Field label={t.pershkrimi}>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          className={cn(inputClass, "resize-none")}
          required
        />
      </Field>

      <div className="grid gap-6 lg:grid-cols-2">
        <Field label={`${t.cmimi} (EUR)`}>
          <input
            value={priceEuros}
            onChange={(event) => setPriceEuros(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            required
          />
        </Field>
        <Field label={t.cmimiKrahasimit}>
          <input
            value={compareAtEuros}
            onChange={(event) => setCompareAtEuros(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Field label={t.stina}>
          <select
            value={season}
            onChange={(event) => {
              const nextSeason = event.target.value;
              setSeason(nextSeason);
              const allowed = getCategoriesForSeason(nextSeason as SeasonKey);
              if (!allowed.some((item) => item.key === category)) {
                setCategory(allowed[0]?.key as Category);
              }
            }}
            className={inputClass}
          >
            {collections.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.kategoria}>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className={inputClass}
          >
            {allowedCategories.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.ngjyra}>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className={inputClass}
          >
            {COLORS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t.madhesite}>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm",
                sizes.includes(size)
                  ? "border-choco bg-choco text-ivory"
                  : "border-beige text-choco",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-choco">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => setInStock(event.target.checked)}
          />
          {t.neStok}
        </label>
        <label className="flex items-center gap-2 text-sm text-choco">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
          Featured
        </label>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.fotot}
          </h2>
          <label className="cursor-pointer rounded-full border border-beige px-4 py-2 text-sm text-choco hover:bg-cream">
            {uploading ? t.dukeUDerguar : t.ngarkoFoto}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
          </label>
        </div>

        <ul className="space-y-4">
          {images.map((image, index) => (
            <li
              key={`${image.path}-${index}`}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-beige p-4"
            >
              <div className="relative h-24 w-20 overflow-hidden rounded-md bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getProductImageUrl(image.path)}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                value={image.alt}
                onChange={(event) =>
                  setImages((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, alt: event.target.value }
                        : item,
                    ),
                  )
                }
                placeholder={t.pershkrimiFotos}
                className={cn(inputClass, "min-w-[220px] flex-1")}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  className="rounded-full border border-beige px-3 py-1"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  className="rounded-full border border-beige px-3 py-1"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="rounded-full border border-beige px-3 py-1"
                >
                  {t.hiq}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </form>
      <div className="flex flex-wrap gap-4">
        <Button
          type="submit"
          form="product-edit-form"
          disabled={pending || images.length === 0}
        >
          {pending ? t.dukeUDerguar : t.ruaj}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          {t.mbyll}
        </Button>
        {product && (
          <form action={deleteProductAction.bind(null, product.id)}>
            <Button type="submit" variant="secondary">
              {t.fshi}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";
