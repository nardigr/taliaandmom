import { Category } from "@prisma/client";
import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { findOrCreateCustomer } from "@/lib/customers/find-or-create";
import { CATEGORIES, DEFAULT_COLLECTIONS } from "@/lib/config";
import { guardSensitiveTool } from "@/lib/ai/tool-guard";
import type { GeminiToolHandler } from "@/lib/ai/gemini";
import { sendAiContactNotification } from "@/lib/email/send-ai-contact";
import { getCurrency, getShippingSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/money";

const LEGACY_SEASON_MAP: Record<string, string> = {
  PRANVERE: "pranvere",
  VERE: "vere",
  VJESHTE: "vjeshte",
  DIMER: "dimer",
};

function normalizeSeasonSlug(value?: string): string | undefined {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase();
  if (LEGACY_SEASON_MAP[upper]) return LEGACY_SEASON_MAP[upper];
  return value.trim().toLowerCase();
}

const seasonEnum = z.string().trim().min(1).optional();
const categoryEnum = z.nativeEnum(Category).optional();

const searchProductsArgs = z.object({
  query: z.string().trim().min(1).optional(),
  season: seasonEnum,
  category: categoryEnum,
  limit: z.number().int().min(1).max(10).optional(),
});

const getProductDetailsArgs = z.object({
  slug: z.string().trim().min(1),
});

const requestContactArgs = z.object({
  fullName: z.string().min(2, "Ju lutem shkruani emrin e plotë"),
  email: z.string().email("Email i pavlefshëm"),
  phone: z.string().min(6, "Ju lutem shkruani një numër telefoni të vlefshëm"),
  subject: z.string().min(2),
  message: z.string().min(2).max(2000),
});

const declarations: Record<string, FunctionDeclaration> = {
  search_products: {
    name: "search_products",
    description:
      "Kërkon produkte në katalog. Përdore kur klienti pyet për fustane, xhaketa, stinë specifike etj. Kthe vetëm produkte reale nga baza.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Tekst kërkimi (emër produkti ose fjalë kyçe)",
        },
        season: {
          type: SchemaType.STRING,
          description: "Filtro sipas koleksionit/stinës (p.sh. pranvere, vere, vjeshte, dimer)",
        },
        category: {
          type: SchemaType.STRING,
          format: "enum",
          enum: [
            "KOSTUME",
            "FUSTANE",
            "KEMISHA",
            "PANTALLONA",
            "XHAKETA",
            "PALLTO",
          ],
          description: "Filtro sipas kategorisë",
        },
        limit: {
          type: SchemaType.NUMBER,
          description: "Numri maksimal i rezultateve (default 6)",
        },
      },
    },
  },
  get_product_details: {
    name: "get_product_details",
    description:
      "Merr detaje të plota për një produkt me slug. Përdore kur klienti pyet për çmim, madhësi, ngjyrë ose disponueshmëri të një produkti specifik.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        slug: { type: SchemaType.STRING, description: "Slug i produktit nga URL" },
      },
      required: ["slug"],
    },
  },
  get_shipping_info: {
    name: "get_shipping_info",
    description:
      "Kthen informacionin aktual për transport dhe pragun e transportit falas. Përdore kur pyetet për dërgesë ose kosto transporti.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  request_contact: {
    name: "request_contact",
    description:
      "Regjistron kërkesë kontakti për ekipin e Talja&mom. Përdore për porosi speciale, pyetje që nuk i di, ose kur klienti dëshiron të flasë me njeri. Duhet të kesh mbledhur të dhënat dhe konfirmimin e klientit.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        fullName: { type: SchemaType.STRING, description: "Emri i plotë" },
        email: { type: SchemaType.STRING, description: "Email" },
        phone: { type: SchemaType.STRING, description: "Telefon" },
        subject: { type: SchemaType.STRING, description: "Tema e kërkesës" },
        message: { type: SchemaType.STRING, description: "Mesazhi i klientit" },
      },
      required: ["fullName", "email", "phone", "subject", "message"],
    },
  },
};

interface ToolContext {
  sessionId: string;
  recentUserMessages: string[];
}

function seasonLabel(key: string) {
  return DEFAULT_COLLECTIONS.find((s) => s.slug === key)?.label ?? key;
}

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function buildTools(ctx: ToolContext): GeminiToolHandler[] {
  const wrap = (
    name: string,
    execute: GeminiToolHandler["execute"],
  ): GeminiToolHandler["execute"] => {
    return async (rawArgs) => {
      const guard = await guardSensitiveTool({
        toolName: name,
        args: rawArgs,
        sessionId: ctx.sessionId,
        recentUserMessages: ctx.recentUserMessages,
      });
      if (!guard.allowed) {
        return { ok: false, reason: guard.reason, message: guard.message };
      }
      return execute(rawArgs);
    };
  };

  return [
    {
      name: "search_products",
      declaration: declarations.search_products,
      execute: async (rawArgs) => {
        const args = searchProductsArgs.parse(rawArgs);
        const limit = args.limit ?? 6;
        const currency = await getCurrency();
        const season = normalizeSeasonSlug(args.season);

        const products = await db.product.findMany({
          where: {
            ...(season ? { season } : {}),
            ...(args.category ? { category: args.category } : {}),
            ...(args.query
              ? {
                  OR: [
                    { name: { contains: args.query, mode: "insensitive" } },
                    { description: { contains: args.query, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: limit,
          select: {
            name: true,
            slug: true,
            priceCents: true,
            compareAtCents: true,
            season: true,
            category: true,
            color: true,
            sizes: true,
            inStock: true,
          },
        });

        return {
          ok: true,
          count: products.length,
          products: products.map((p) => ({
            name: p.name,
            slug: p.slug,
            url: `/produkti/${p.slug}`,
            price: formatPrice(p.priceCents, currency),
            compareAt: p.compareAtCents
              ? formatPrice(p.compareAtCents, currency)
              : null,
            season: seasonLabel(p.season),
            category: categoryLabel(p.category),
            color: p.color,
            sizes: p.sizes,
            inStock: p.inStock,
          })),
        };
      },
    },
    {
      name: "get_product_details",
      declaration: declarations.get_product_details,
      execute: async (rawArgs) => {
        const args = getProductDetailsArgs.parse(rawArgs);
        const currency = await getCurrency();

        const product = await db.product.findUnique({
          where: { slug: args.slug },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        });

        if (!product) {
          return {
            ok: false,
            reason: "not_found",
            message: "Produkti nuk u gjet. Sugjero klientit të shfletojë /koleksioni.",
          };
        }

        return {
          ok: true,
          product: {
            name: product.name,
            slug: product.slug,
            url: `/produkti/${product.slug}`,
            description: product.description,
            price: formatPrice(product.priceCents, currency),
            compareAt: product.compareAtCents
              ? formatPrice(product.compareAtCents, currency)
              : null,
            season: seasonLabel(product.season),
            category: categoryLabel(product.category),
            color: product.color,
            sizes: product.sizes,
            inStock: product.inStock,
            image: product.images[0]?.path ?? null,
          },
        };
      },
    },
    {
      name: "get_shipping_info",
      declaration: declarations.get_shipping_info,
      execute: async () => {
        const [shipping, currency] = await Promise.all([
          getShippingSettings(),
          getCurrency(),
        ]);

        return {
          ok: true,
          shippingFee: formatPrice(shipping.shippingFeeCents, currency),
          freeShippingOver: shipping.freeShippingOverCents
            ? formatPrice(shipping.freeShippingOverCents, currency)
            : null,
          paymentMethods: ["Pagesë në dorëzim (kesh)", "Transfertë bankare"],
        };
      },
    },
    {
      name: "request_contact",
      declaration: declarations.request_contact,
      execute: wrap("request_contact", async (rawArgs) => {
        const data = requestContactArgs.parse(rawArgs);

        const customerId = await findOrCreateCustomer(db, {
          firstName: data.fullName.split(/\s+/)[0] ?? data.fullName,
          lastName: data.fullName.split(/\s+/).slice(1).join(" ") || data.fullName,
          phone: data.phone,
          email: data.email,
        });

        await db.contactRequest.create({
          data: {
            source: "ai_chat",
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
            status: "new",
            sessionId: ctx.sessionId,
            customerId,
          },
        });

        const emailed = await sendAiContactNotification({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          sessionId: ctx.sessionId,
        });

        await updateSessionLead(ctx.sessionId, data.fullName, data.email);

        return {
          ok: true,
          emailed,
          message: emailed
            ? "Kërkesa u regjistrua. Ekipi ynë do t'ju përgjigjet së shpejti."
            : "Kërkesa u regjistrua. Do t'ju kontaktojmë së shpejti.",
        };
      }),
    },
  ];
}

async function updateSessionLead(
  sessionId: string,
  name: string,
  email: string,
): Promise<void> {
  try {
    await db.chatSession.update({
      where: { id: sessionId },
      data: { leadName: name, leadEmail: email },
    });
  } catch (err) {
    console.warn("[ai-tools] failed to update session lead:", err);
  }
}
