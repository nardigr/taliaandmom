import { Category, PrismaClient } from "@prisma/client";
import { DEFAULT_COLLECTIONS } from "../src/lib/config";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SETTINGS: Record<string, string> = {
  currency: "EUR",
  shippingFeeCents: "500",
  freeShippingOverCents: "10000",
  bankName: "PLACEHOLDER Bank",
  bankIban: "AL00 0000 0000 0000 0000 0000 0000",
  bankHolder: "Talja&mom SH.P.K.",
  contactPhone: "+355 00 000 0000",
  contactEmail: "info@taljamom.al",
  contactAddress: "PLACEHOLDER — Rruga e Modës, Tiranë",
  whatsappNumber: "355000000000",
  instagramUrl: "https://instagram.com/PLACEHOLDER",
  facebookUrl: "https://facebook.com/PLACEHOLDER",
  aiAssistantEnabled: "true",
  aiAssistantName: "Talia",
  aiAssistantAvatarUrl: "",
  aiFabCaption: "Përshëndetje! Unë jam {name} — si mund t'ju ndihmoj?",
  aiKnowledgeBase:
    "Talja&mom është dyqan online i modës femërore. Stinët: pranverë, verë, vjeshtë, dimër. Pagesa: kesh në dorëzim ose transfertë bankare. Për kthime, shihni /politika-e-kthimit.",
  aiSystemPrompt: "",
};

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  season: string;
  category: Category;
  color: string;
  sizes: string[];
  inStock?: boolean;
  featured?: boolean;
  imageSeeds: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "fustan-pranvere-roze",
    name: "Fustan i lehtë rozë",
    description:
      "Fustan elegant me siluetë të lirshme, i përshtatshëm për ditët e ngrohta të pranverës. PLACEHOLDER — përshkrim i plotë nga pronarja.",
    priceCents: 4500,
    compareAtCents: 5500,
    season: "pranvere",
    category: Category.FUSTANE,
    color: "roze",
    sizes: ["S", "M", "L"],
    featured: true,
    imageSeeds: ["pranvere-fustan-1", "pranvere-fustan-2"],
  },
  {
    slug: "kemish-pranvere-bardhe",
    name: "Këmishë e bardhë pranverore",
    description: "Këmishë me prerje klasike dhe pëlhurë të lehtë. PLACEHOLDER.",
    priceCents: 3200,
    season: "pranvere",
    category: Category.KEMISHA,
    color: "e-bardhe",
    sizes: ["S", "M", "L", "XL"],
    imageSeeds: ["pranvere-kemish-1"],
  },
  {
    slug: "kostum-pranvere-bezhe",
    name: "Kostum bezhë pranveror",
    description: "Kostum dy copësh me stil minimal. PLACEHOLDER.",
    priceCents: 7800,
    season: "pranvere",
    category: Category.KOSTUME,
    color: "bezhe",
    sizes: ["S", "M", "L"],
    imageSeeds: ["pranvere-kostum-1", "pranvere-kostum-2", "pranvere-kostum-3"],
  },
  {
    slug: "pantallona-pranvere-krem",
    name: "Pantallona krem pranverore",
    description: "Pantallona me prerje të lartë dhe pëlhurë të butë. PLACEHOLDER.",
    priceCents: 3800,
    season: "pranvere",
    category: Category.PANTALLONA,
    color: "krem",
    sizes: ["S", "M", "L"],
    imageSeeds: ["pranvere-pantallona-1"],
  },
  {
    slug: "fustan-vere-i-lehte",
    name: "Fustan veror i lehtë",
    description: "Fustan me motive florale delikate për ditët e nxehta. PLACEHOLDER.",
    priceCents: 4200,
    season: "vere",
    category: Category.FUSTANE,
    color: "multikolor",
    sizes: ["S", "M", "L"],
    featured: true,
    imageSeeds: ["vere-fustan-1", "vere-fustan-2"],
  },
  {
    slug: "kemish-vere-blu",
    name: "Këmishë blu verore",
    description: "Këmishë me mëngë të shkurtra dhe ngjyrë të thellë blu. PLACEHOLDER.",
    priceCents: 2900,
    season: "vere",
    category: Category.KEMISHA,
    color: "blu",
    sizes: ["S", "M", "L"],
    imageSeeds: ["vere-kemish-1"],
  },
  {
    slug: "kostum-vere-ari",
    name: "Kostum ari veror",
    description: "Kostum me detaje ari për evente speciale. PLACEHOLDER.",
    priceCents: 8500,
    season: "vere",
    category: Category.KOSTUME,
    color: "ari",
    sizes: ["S", "M", "L"],
    imageSeeds: ["vere-kostum-1", "vere-kostum-2"],
  },
  {
    slug: "pantallona-vere-e-zeze",
    name: "Pantallona e zezë verore",
    description: "Pantallona me prerje të drejtë, stil urban. PLACEHOLDER.",
    priceCents: 3600,
    season: "vere",
    category: Category.PANTALLONA,
    color: "e-zeze",
    sizes: ["S", "M", "L", "XL"],
    inStock: false,
    imageSeeds: ["vere-pantallona-1"],
  },
  {
    slug: "fustan-vjeshte-bordo",
    name: "Fustan bordo vjeshtor",
    description: "Fustan me gjatësi mesi dhe ngjyrë bordo të thellë. PLACEHOLDER.",
    priceCents: 4800,
    season: "vjeshte",
    category: Category.FUSTANE,
    color: "bordo",
    sizes: ["S", "M", "L"],
    imageSeeds: ["vjeshte-fustan-1", "vjeshte-fustan-2"],
  },
  {
    slug: "xhaket-vjeshte-kafe",
    name: "Xhaketë kafe vjeshtore",
    description: "Xhaketë me stof të butë, e përshtatshme për ditët e freskëta. PLACEHOLDER.",
    priceCents: 5200,
    season: "vjeshte",
    category: Category.XHAKETA,
    color: "kafe",
    sizes: ["S", "M", "L"],
    featured: true,
    imageSeeds: ["vjeshte-xhaket-1", "vjeshte-xhaket-2"],
  },
  {
    slug: "kemish-vjeshte-gri",
    name: "Këmishë gri vjeshtore",
    description: "Këmishë me stof të trashë dhe prerje oversize. PLACEHOLDER.",
    priceCents: 3400,
    season: "vjeshte",
    category: Category.KEMISHA,
    color: "gri",
    sizes: ["S", "M", "L", "XL"],
    imageSeeds: ["vjeshte-kemish-1"],
  },
  {
    slug: "pantallona-vjeshte-jeshile",
    name: "Pantallona jeshile vjeshtore",
    description: "Pantallona me stof të trashë dhe ngjyrë natyrale. PLACEHOLDER.",
    priceCents: 3900,
    season: "vjeshte",
    category: Category.PANTALLONA,
    color: "jeshile",
    sizes: ["S", "M", "L"],
    imageSeeds: ["vjeshte-pantallona-1", "vjeshte-pantallona-2"],
  },
  {
    slug: "fustan-dimer-e-kuqe",
    name: "Fustan i kuq dimëror",
    description: "Fustan me stof të trashë për festat e fundvitit. PLACEHOLDER.",
    priceCents: 5500,
    season: "dimer",
    category: Category.FUSTANE,
    color: "e-kuqe",
    sizes: ["S", "M", "L"],
    imageSeeds: ["dimer-fustan-1"],
  },
  {
    slug: "pallto-dimer-e-zeze",
    name: "Pallto e zezë dimërore",
    description: "Pallto me stof të trashë dhe siluetë klasike. PLACEHOLDER.",
    priceCents: 12000,
    season: "dimer",
    category: Category.PALLTO,
    color: "e-zeze",
    sizes: ["S", "M", "L"],
    featured: true,
    imageSeeds: ["dimer-pallto-1", "dimer-pallto-2", "dimer-pallto-3"],
  },
  {
    slug: "kostum-dimer-krem",
    name: "Kostum krem dimëror",
    description: "Kostum me stof të ngrohtë për sezonin e ftohtë. PLACEHOLDER.",
    priceCents: 9200,
    season: "dimer",
    category: Category.KOSTUME,
    color: "krem",
    sizes: ["S", "M", "L"],
    imageSeeds: ["dimer-kostum-1", "dimer-kostum-2"],
  },
  {
    slug: "kemish-dimer-bezhe",
    name: "Këmishë bezhë dimërore",
    description: "Këmishë me stof flaneli, e ngrohtë dhe elegante. PLACEHOLDER.",
    priceCents: 3100,
    season: "dimer",
    category: Category.KEMISHA,
    color: "bezhe",
    sizes: ["S", "M", "L", "XL"],
    imageSeeds: ["dimer-kemish-1"],
  },
];

function picsumUrl(seed: string, width = 800, height = 1000) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env for seeding");
  }

  console.log("Seeding settings...");
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seeding admin user...");
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Admin" },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
    },
  });

  console.log("Seeding SEO settings...");
  await prisma.seoSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteTitle: "Talja&mom — Modë femrash",
      siteDescription: "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment.",
      businessName: "Talja&mom",
      businessType: "ClothingStore",
      businessCountry: "AL",
      ogImage: "/og-default.svg",
    },
  });

  const pageSeoPresets = [
    { pageSlug: "home", pageTitle: "Talja&mom — Modë femrash", metaDescription: "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment." },
    { pageSlug: "koleksioni", pageTitle: "Koleksioni", metaDescription: "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment." },
    { pageSlug: "rreth-nesh", pageTitle: "Rreth nesh", metaDescription: "Historia e Talja&mom — elegancë dhe stil për çdo stinë." },
    { pageSlug: "kontakt", pageTitle: "Kontakt", metaDescription: "Na kontaktoni për pyetje, porosi ose informacion." },
    { pageSlug: "politika-e-kthimit", pageTitle: "Politika e kthimit", metaDescription: "Politika e kthimit dhe ndërrimit të produkteve Talja&mom." },
    { pageSlug: "kushtet-e-perdorimit", pageTitle: "Kushtet e përdorimit", metaDescription: "Kushtet e përdorimit të faqes Talja&mom." },
    { pageSlug: "shporta", pageTitle: "Shporta", metaDescription: "Shporta juaj e blerjeve në Talja&mom." },
  ];

  for (const preset of pageSeoPresets) {
    await prisma.pageSeo.upsert({
      where: { pageSlug: preset.pageSlug },
      update: {},
      create: preset,
    });
  }

  console.log("Seeding collections...");
  for (const [index, item] of DEFAULT_COLLECTIONS.entries()) {
    await prisma.collection.upsert({
      where: { slug: item.slug },
      update: { label: item.label, sortOrder: index, active: true },
      create: { slug: item.slug, label: item.label, sortOrder: index, active: true },
    });
  }

  console.log("Seeding products...");
  for (const product of PRODUCTS) {
    const { imageSeeds, inStock = true, featured = false, compareAtCents, ...data } =
      product;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...data,
        compareAtCents: compareAtCents ?? null,
        inStock,
        featured,
        images: {
          deleteMany: {},
          create: imageSeeds.map((seed, index) => ({
            path: picsumUrl(seed),
            alt: `${product.name} — foto ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
      create: {
        ...data,
        compareAtCents: compareAtCents ?? null,
        inStock,
        featured,
        images: {
          create: imageSeeds.map((seed, index) => ({
            path: picsumUrl(seed),
            alt: `${product.name} — foto ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${PRODUCTS.length} products, settings, and admin user.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
