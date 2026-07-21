"use server";

import { OrderStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { productFormSchema, settingsFormSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/slug";
import { db } from "@/lib/db";
import { logOrderEvent } from "@/lib/orders/order-events";
import { deleteProductImage } from "@/lib/storage/local";
import { t } from "@/lib/i18n/sq";

export async function adminSignOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export type AdminActionState = {
  error?: string;
  success?: string;
};

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/koleksioni");
  revalidatePath("/shporta");
  revalidateTag(CACHE_TAGS.products, "max");
}

function revalidateSiteSettings() {
  revalidateTag(CACHE_TAGS.settings, "max");
  revalidatePath("/", "layout");
  revalidatePath("/kontakt");
}

function parseProductPayload(formData: FormData) {
  const sizes = formData.getAll("sizes").map(String);
  const imagesRaw = formData.get("images");
  let images: unknown = [];

  try {
    images = JSON.parse(String(imagesRaw ?? "[]"));
  } catch {
    images = [];
  }

  return productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceCents: formData.get("priceCents"),
    compareAtCents: formData.get("compareAtCents"),
    season: formData.get("season"),
    category: formData.get("category"),
    color: formData.get("color"),
    sizes,
    inStock: formData.get("inStock") === "true",
    featured: formData.get("featured") === "true",
    images,
  });
}

export async function saveProductAction(
  productId: string | null,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = parseProductPayload(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const data = parsed.data;
  const compareAtCents =
    data.compareAtCents === "" || data.compareAtCents == null
      ? null
      : Number(data.compareAtCents);

  const collection = await db.collection.findUnique({ where: { slug: data.season } });
  if (!collection) {
    return { error: t.gabimRuajtjes };
  }

  const slug = slugify(data.slug || data.name);

  try {
    if (productId) {
      const existing = await db.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!existing) return { error: t.gabimRuajtjes };

      const removedImages = existing.images.filter(
        (image) => !data.images.some((item) => item.id === image.id),
      );

      await db.product.update({
        where: { id: productId },
        data: {
          slug,
          name: data.name,
          description: data.description,
          priceCents: data.priceCents,
          compareAtCents,
          season: data.season,
          category: data.category,
          color: data.color,
          sizes: data.sizes,
          inStock: data.inStock,
          featured: data.featured,
          images: {
            deleteMany: {},
            create: data.images.map((image, index) => ({
              path: image.path,
              alt: image.alt,
              sortOrder: index,
            })),
          },
        },
      });

      for (const image of removedImages) {
        if (!image.path.startsWith("http")) {
          await deleteProductImage(image.path).catch(() => undefined);
        }
      }
    } else {
      await db.product.create({
        data: {
          slug,
          name: data.name,
          description: data.description,
          priceCents: data.priceCents,
          compareAtCents,
          season: data.season,
          category: data.category,
          color: data.color,
          sizes: data.sizes,
          inStock: data.inStock,
          featured: data.featured,
          images: {
            create: data.images.map((image, index) => ({
              path: image.path,
              alt: image.alt,
              sortOrder: index,
            })),
          },
        },
      });
    }
  } catch {
    return { error: t.gabimRuajtjes };
  }

  revalidateCatalog();
  redirect("/admin/produktet");
}

export async function deleteProductAction(productId: string, _formData?: FormData) {
  await requireAdmin();

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) return;

  await db.product.delete({ where: { id: productId } });

  for (const image of product.images) {
    if (!image.path.startsWith("http")) {
      await deleteProductImage(image.path).catch(() => undefined);
    }
  }

  revalidateCatalog();
  redirect("/admin/produktet");
}

export async function toggleProductFeaturedAction(
  productId: string,
  featured: boolean,
) {
  await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { featured } });
  revalidateCatalog();
}

export async function toggleProductStockAction(productId: string, inStock: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { inStock } });
  revalidateCatalog();
}

export async function bulkToggleProductStockAction(formData: FormData) {
  await requireAdmin();
  const ids = String(formData.get("productIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const inStock = formData.get("inStock") === "true";
  if (ids.length === 0) return;

  await db.product.updateMany({
    where: { id: { in: ids } },
    data: { inStock },
  });
  revalidateCatalog();
  revalidatePath("/admin/produktet");
}

export async function updateOrderStatusAction(
  orderId: string,
  formData: FormData,
) {
  await requireAdmin();
  const status = formData.get("status") as OrderStatus;
  const existing = await db.order.findUnique({ where: { id: orderId } });
  if (!existing) return;

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status } });
    if (existing.status !== status) {
      await logOrderEvent(tx, {
        orderId,
        eventType: "status_change",
        fromValue: existing.status,
        toValue: status,
      });
    }
  });

  revalidatePath("/admin/porosite");
  revalidatePath(`/admin/porosite/${orderId}`);
  revalidatePath("/admin/epikoinonia");
}

export async function updateOrderPaymentStatusAction(
  orderId: string,
  formData: FormData,
) {
  await requireAdmin();
  const paymentStatus = formData.get("paymentStatus") as PaymentStatus;
  const existing = await db.order.findUnique({ where: { id: orderId } });
  if (!existing) return;

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { paymentStatus } });
    if (existing.paymentStatus !== paymentStatus) {
      await logOrderEvent(tx, {
        orderId,
        eventType: "payment_status_change",
        fromValue: existing.paymentStatus,
        toValue: paymentStatus,
      });
    }
  });

  revalidatePath("/admin/porosite");
  revalidatePath(`/admin/porosite/${orderId}`);
}

export async function saveSettingsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = settingsFormSchema.safeParse({
    currency: formData.get("currency"),
    shippingFeeCents: formData.get("shippingFeeCents"),
    freeShippingOverCents: formData.get("freeShippingOverCents"),
    bankName: formData.get("bankName"),
    bankIban: formData.get("bankIban"),
    bankHolder: formData.get("bankHolder"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
    contactAddress: formData.get("contactAddress"),
    whatsappNumber: formData.get("whatsappNumber"),
    instagramUrl: formData.get("instagramUrl"),
    facebookUrl: formData.get("facebookUrl"),
    logoUrl: formData.get("logoUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const data = parsed.data;
  const entries: Record<string, string> = {
    currency: data.currency,
    shippingFeeCents: String(data.shippingFeeCents),
    freeShippingOverCents:
      data.freeShippingOverCents === "" || data.freeShippingOverCents == null
        ? ""
        : String(data.freeShippingOverCents),
    bankName: data.bankName,
    bankIban: data.bankIban,
    bankHolder: data.bankHolder,
    contactPhone: data.contactPhone,
    contactEmail: data.contactEmail,
    contactAddress: data.contactAddress,
    whatsappNumber: data.whatsappNumber,
    instagramUrl: data.instagramUrl,
    facebookUrl: data.facebookUrl,
    logoUrl: data.logoUrl ?? "",
  };

  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  revalidateCatalog();
  revalidateSiteSettings();
  revalidatePath("/admin/cilesimet");
  revalidatePath("/");
  return { success: t.uRuajt };
}
