import { db } from "@/lib/db";
import { CATEGORIES, DEFAULT_COLLECTIONS } from "@/lib/config";
import { getAiKnowledgeBase, getAiSystemPromptOverride } from "@/lib/ai/assistant-config";
import { getContactSettings, getCurrency, getShippingSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/money";
import { env } from "@/lib/env";

interface BusinessInfo {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  siteUrl: string;
}

async function getBusinessInfo(): Promise<BusinessInfo> {
  const [seo, contact] = await Promise.all([
    db.seoSettings.findUnique({ where: { id: "default" } }),
    getContactSettings(),
  ]);

  return {
    name: seo?.businessName || "Talja&mom",
    description:
      seo?.businessDescription ||
      "Dyqan online i modës femërore — koleksione elegante për çdo stinë.",
    email: seo?.businessEmail || contact.contactEmail,
    phone: seo?.businessPhone || contact.contactPhone,
    address: [seo?.businessAddress, seo?.businessCity, seo?.businessCountry]
      .filter(Boolean)
      .join(", "),
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
  };
}

async function getFeaturedProductsSummary(): Promise<string> {
  const currency = await getCurrency();
  const products = await db.product.findMany({
    where: { inStock: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 12,
    select: {
      name: true,
      slug: true,
      priceCents: true,
      season: true,
      category: true,
      inStock: true,
    },
  });

  if (products.length === 0) {
    return "(Nuk ka produkte aktive — drejto klientin te /koleksioni.)";
  }

  const seasonLabel = (key: string) =>
    DEFAULT_COLLECTIONS.find((s) => s.slug === key)?.label ?? key;
  const categoryLabel = (key: string) =>
    CATEGORIES.find((c) => c.key === key)?.label ?? key;

  return products
    .map(
      (p) =>
        `  • ${p.name} — ${formatPrice(p.priceCents, currency)} (${seasonLabel(p.season)}, ${categoryLabel(p.category)}, /produkti/${p.slug})`,
    )
    .join("\n");
}

async function getShippingSummary(): Promise<string> {
  const [shipping, currency] = await Promise.all([
    getShippingSettings(),
    getCurrency(),
  ]);

  const fee = formatPrice(shipping.shippingFeeCents, currency);
  if (shipping.freeShippingOverCents) {
    const threshold = formatPrice(shipping.freeShippingOverCents, currency);
    return `Transporti: ${fee}. Transport falas për porosi mbi ${threshold}.`;
  }
  return `Transporti: ${fee}.`;
}

interface BuildPromptOptions {
  customOverride?: string | null;
}

export async function buildSystemPrompt(options: BuildPromptOptions = {}): Promise<string> {
  const customOverride = options.customOverride ?? (await getAiSystemPromptOverride());
  const [biz, productsSummary, shippingSummary, knowledgeBase] = await Promise.all([
    getBusinessInfo(),
    getFeaturedProductsSummary(),
    getShippingSummary(),
    getAiKnowledgeBase(),
  ]);

  const businessBlock = [
    `Emri: ${biz.name}`,
    `Përshkrimi: ${biz.description}`,
    biz.email && `Email: ${biz.email}`,
    biz.phone && `Telefon: ${biz.phone}`,
    biz.address && `Adresa: ${biz.address}`,
    `Website: ${biz.siteUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const knowledgeBlock = knowledgeBase.trim()
    ? knowledgeBase.trim()
    : "(Nuk është konfiguruar ende baza e njohurive AI në admin.)";

  if (customOverride && customOverride.trim().length > 50) {
    return `${customOverride.trim()}

---
BAZA E NJOHURIVE AI (konteksti kryesor i dyqanit):
${knowledgeBlock}

---
TË DHËNAT E BIZNESIT (burim zyrtar — MOS E SHPIK):
${businessBlock}

TRANSPORTI:
${shippingSummary}

PRODUKTET (mostër nga katalogu — përdor search_products për kërkim të plotë):
${productsSummary}
`;
  }

  return `Je asistenti zyrtar AI i ${biz.name}, një dyqan online i modës femërore.

ROLI
- Ndihmon vizitorët të zbulojnë produkte, madhësi, stinë dhe kategori.
- Përgjigjet për transport, pagesa (kesh në dorëzim, transfertë bankare), kthime dhe porosi.
- Drejton klientët te koleksioni (/koleksioni), produktet specifike (/produkti/{slug}) ose WhatsApp për ndihmë të shpejtë.
- Gjithmonë përgjigju në shqip, me ton të ngrohtë dhe profesional.

STILI
- I ngrohtë, i sinqertë, i shkurtër. Pa fjalë bosh marketingu.
- Paragrafë të shkurtër dhe lista kur përsëriten detaje.
- KURRË mos shpik çmime, stok, madhësi ose kontakte — përdor VETËM informacionin më poshtë ose mjetet (tools).
- Nëse nuk e di diçka, thuaje dhe ofro të regjistrosh një kërkesë kontakti ose të drejtosh te WhatsApp.

VEPRIMET (function calling)
- \`search_products\` — kur klienti kërkon produkte sipas emrit, stinës ose kategorisë.
- \`get_product_details\` — kur pyet për një produkt specifik (slug ose emër).
- \`get_shipping_info\` — kur pyet për transport dhe transport falas.
- \`request_contact\` — për pyetje të personalizuara, porosi speciale ose kur dëshiron të flasë me ekipin.
- Para \`request_contact\`, mblidh: emër i plotë, email, telefon, temë dhe mesazh. Konfirmo me klientin para dërgimit.

KUFRIT
- Mos diskuto strategji çmimesh të brendshme ose konkurrentë.
- Mos premto zbritje që nuk mund t'i verifikosh.
- Mos kërko të dhëna kartë krediti ose fjalëkalime.
- Refuzo me mirësjellje pyetje jashtë temës (kodi, këshilla personale etj.).
- Kur klienti është gati të blejë, drejto te shporta (/shporta) ose checkout.

BAZA E NJOHURIVE AI:
${knowledgeBlock}

TË DHËNAT E BIZNESIT (burim zyrtar):
${businessBlock}

TRANSPORTI:
${shippingSummary}

PRODUKTET (mostër — përdor tools për të dhëna të freskëta):
${productsSummary}
`;
}
