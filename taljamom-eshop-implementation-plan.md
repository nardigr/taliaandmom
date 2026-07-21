# Talja&mom — E-shop Implementation Plan (for Cursor)

> **How to use this file:** Place it in the repo root. Implement **one phase at a time** (§8), in order.
> For each phase, prompt Cursor: *"Read @taljamom-eshop-implementation-plan.md. Implement Phase N only. Follow the Albanian UI dictionary (§6) exactly. Do not invent Albanian text. Ask before deviating from the plan."*
> After each phase: run `npm run build`, fix all type errors, verify the acceptance criteria, commit.

---

## 0. Project overview

- Women's fashion e-shop for the brand **Talja&mom**, entirely in **Albanian (sq)**, for the Albanian market.
- **V1 has NO online card payments.** Checkout works with **Cash on Delivery (Pagesë në dorëzim)** and **Bank transfer (Transfertë bankare)** — the dominant methods in the Albanian market.
- The architecture MUST be **payment-ready**: a card gateway (bank virtual POS, Paysera, etc.) must be pluggable later **without refactoring** (see §7).
- **Admin panel** so the (non-technical) shop owner can manage products and orders herself.
- Currency: configurable via Settings. Default **EUR** (`€ 45` format, like Albanian reference shops). Alternative: LEK (`4.500 L`). Store prices as integer cents (`priceCents`) to stay currency-agnostic.
- Structure by **season** (Pranverë / Verë / Vjeshtë / Dimër) with categories inside each season, per the owner's brief.
- Style: **elegant, warm, feminine, premium.** Floral brand presentation on the homepage. Generous whitespace, large photography, minimal UI.
- Everything marked `PLACEHOLDER` must be confirmed with the owner before launch (photos, texts, prices, bank details, shipping fees, contact info, social links).

**Language rules:** All user-facing text = Albanian (§6). Code, comments, commit messages, admin code identifiers = English. Admin panel UI text = Albanian (the owner uses it).

---

## 1. Tech stack

- **Next.js 15+** (App Router, TypeScript, React Server Components, Server Actions)
- **Tailwind CSS v4** (tokens via `@theme` in `globals.css`)
- **PostgreSQL + Prisma ORM**
- **Auth.js (NextAuth v5)** — credentials provider, admin only (no customer accounts in v1)
- **zod** (validation) + **react-hook-form** (checkout & admin forms)
- **zustand** (cart state, persisted to `localStorage`)
- **sharp** (server-side image processing on upload)
- Fonts via `next/font/google`: **Playfair Display** (display) + **Poppins** (body), subsets `["latin", "latin-ext"]` — must render **ë** and **ç** correctly.
- No CMS. Products are managed in the custom admin panel.

---

## 2. Design system

Brand personality: elegant, warm, feminine, premium. The design must feel like a boutique, not a marketplace: few elements, precise spacing, photography does the talking.

### 2.1 Color tokens (Tailwind v4 `@theme` block in `globals.css`)

```css
@theme {
  --color-ivory: #FDFBF6;        /* page background */
  --color-cream: #F5EEE3;        /* alternate section background */
  --color-beige: #E8DCCB;        /* hairline borders, dividers */
  --color-rose-soft: #F8E7E3;    /* soft tint backgrounds, badges */
  --color-rose: #EFCFC9;         /* primary warm pastel pink */
  --color-rose-deep: #D9A79E;    /* hovers, accents, floral motif */
  --color-choco: #4A2F26;        /* chocolate brown: headings, primary buttons */
  --color-choco-soft: #6E4E40;   /* secondary text, button hover */
  --color-ink: #2E211C;          /* body text */
  --font-display: "Playfair Display", "Bodoni Moda", serif;
  --font-sans: "Poppins", "Raleway", sans-serif;
}
```

Rules: ivory background everywhere; cream for alternating sections; never pure white pages. Text contrast must pass WCAG AA (choco/ink on ivory passes; never rose text on ivory for body copy).

### 2.2 Typography

- H1: `font-display`, 40–64px responsive, normal weight, tight leading. Headings in choco.
- Eyebrow labels (above headings): Poppins, 11–12px, `uppercase tracking-[0.25em]`, choco-soft. Used for season names, section labels.
- Body: Poppins 16px, line-height 1.7, ink.
- Prices: Poppins medium, choco.
- Buttons: Poppins, 13–14px, `uppercase tracking-widest`.

### 2.3 Components style

- **Primary button:** choco background, ivory text, `rounded-full`, generous horizontal padding, hover → choco-soft. Example: «Shiko Koleksionin».
- **Secondary button:** 1px choco border on transparent, hover → cream background.
- **Product card:** 3:4 portrait image, `rounded-lg` with hairline beige border, hover = image scale 1.03 + soft shadow; below: name (display font, 18px), price, small «Shiko detajet» link. If `compareAtCents` set → rose-soft badge «Ulje» + old price struck through. If out of stock → semi-transparent overlay «Nuk është në stok».
- **Signature element (the one memorable thing):** a delicate single-line **floral line-art motif** (custom inline SVG, stroke in rose-deep, ~1.5px stroke) that (a) frames the hero, (b) recurs as a small section divider (a single stem/blossom centered between sections), and (c) decorates the «&» in the wordmark. Hand-drawn feel, thin strokes — NOT clipart, NOT emoji, no stock floral photos as decoration. Keep everything else quiet.
- Motion: minimal and soft — fade+rise on section reveal (respect `prefers-reduced-motion`), image hover zoom. Nothing else.

### 2.4 Header / Footer

- Header: ivory, hairline beige bottom border. Left: wordmark «Talja&mom» in Playfair (the «&» in rose-deep). Center/right nav: Kryefaqja, Koleksioni (dropdown: 4 seasons + «Të gjitha»), Rreth nesh, Kontakt. Right: search icon (optional v1), cart icon with count badge (choco circle, ivory number). Mobile: hamburger → full-screen ivory overlay menu, large Playfair links, seasons listed.
- Footer: cream background. Columns: brand + short line, Koleksioni (4 seasons), Informacion (Rreth nesh, Kontakt, Politika e kthimit, Kushtet e përdorimit), Kontakt (address PLACEHOLDER, phone, email, Instagram/Facebook/WhatsApp icons). Bottom line: «© {year} Talja&mom. Të gjitha të drejtat e rezervuara.»
- A floating **WhatsApp button** (bottom-right, choco circle) linking to `https://wa.me/{WHATSAPP_NUMBER from Settings}` — standard and expected in the Albanian market.

---

## 3. Data model (Prisma)

```prisma
enum Season   { PRANVERE VERE VJESHTE DIMER }
enum Category { KOSTUME FUSTANE KEMISHA PANTALLONA XHAKETA PALLTO }
enum OrderStatus   { E_RE KONFIRMUAR DERGUAR DOREZUAR ANULUAR }
enum PaymentMethod { CASH_ON_DELIVERY BANK_TRANSFER CARD }
enum PaymentStatus { UNPAID PAID REFUNDED }

model Product {
  id             String   @id @default(cuid())
  slug           String   @unique
  name           String
  description    String
  priceCents     Int
  compareAtCents Int?          // if set and > priceCents → sale («Ulje»)
  season         Season
  category       Category
  color          String        // key from COLORS config (§5.6)
  sizes          String[]      // e.g. ["S","M","L"] from SIZES config
  inStock        Boolean  @default(true)
  featured       Boolean  @default(false)   // shown in «Të rejat» on homepage
  images         ProductImage[]
  orderItems     OrderItem[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  path      String   // storage key, e.g. "products/abc-1600.webp"
  alt       String
  sortOrder Int      @default(0)
}

model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique   // "TM-2026-0001"
  status        OrderStatus   @default(E_RE)
  paymentMethod PaymentMethod
  paymentStatus PaymentStatus @default(UNPAID)
  firstName     String
  lastName      String
  phone         String
  email         String?
  address       String
  city          String
  notes         String?
  subtotalCents Int
  shippingCents Int
  totalCents    Int
  items         OrderItem[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model OrderItem {
  id             String  @id @default(cuid())
  orderId        String
  order          Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId      String?
  product        Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  nameSnapshot   String
  priceCentsSnap Int
  imageSnapshot  String?
  size           String?
  color          String?
  quantity       Int
}

model AdminUser {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  name         String
}

model Setting {
  key   String @id
  value String
}
```

**Business rules (enforce in zod schemas + admin UI, and in seeds):**
- `XHAKETA` products may ONLY have `season = VJESHTE`.
- `PALLTO` products may ONLY have `season = DIMER`.
- All other categories are allowed in all four seasons.
- Order totals are computed server-side from DB prices — never trust client prices.
- `orderNumber` format `TM-{YYYY}-{NNNN}`, sequential per year, generated in a transaction.

**Settings keys (seeded with placeholders):** `currency` (`EUR`|`LEK`), `shippingFeeCents`, `freeShippingOverCents` (empty = disabled), `bankName`, `bankIban`, `bankHolder`, `contactPhone`, `contactEmail`, `contactAddress`, `whatsappNumber`, `instagramUrl`, `facebookUrl`.

---

## 4. Site map & routes

**Public (all UI text in Albanian):**

| Route | Page |
|---|---|
| `/` | Homepage: hero + seasons + featured |
| `/koleksioni` | All products, full filters |
| `/koleksioni/[stina]` | Season page (`pranvere`, `vere`, `vjeshte`, `dimer`) with category chips + filters |
| `/produkt/[slug]` | Product detail |
| `/shporta` | Cart |
| `/porosia` | Checkout |
| `/porosia/faleminderit/[orderNumber]` | Order confirmation |
| `/rreth-nesh` | About (PLACEHOLDER content) |
| `/kontakt` | Contact info + WhatsApp CTA (form optional) |
| `/politika-e-kthimit` | Return policy (PLACEHOLDER) |
| `/kushtet-e-perdorimit` | Terms (PLACEHOLDER) |

**Admin (guarded by Auth.js middleware):** `/admin` (dashboard), `/admin/produktet` (+ `/i-ri`, `/[id]`), `/admin/porosite` (+ `/[id]`), `/admin/cilesimet`, `/admin/login`.

**API:** `/api/uploads/[...path]` (serve stored images), `/api/payments/[provider]/webhook` (stub, see §7).

**Slug rules:** lowercase, hyphens, transliterate Albanian characters (`ë→e`, `ç→c`). Season URL slugs are ASCII (`pranvere`), display names carry diacritics («Pranverë»).

### Homepage sections (in order)
1. **Hero:** full-width, ivory→rose-soft gradient wash, floral line-art frame (signature element), wordmark, headline PLACEHOLDER: «Elegancë për çdo stinë», subline PLACEHOLDER: «Koleksione të përzgjedhura për çdo moment», primary CTA «Shiko Koleksionin» → `/koleksioni`. Optionally one large brand photo right side (PLACEHOLDER photo).
2. **Seasons grid:** 4 cards (photo PLACEHOLDER per season, season name in Playfair, hover zoom) → each links to its season page.
3. **«Të rejat»:** grid of up to 8 `featured` products + link «Shiko të gjitha».
4. **About teaser:** short PLACEHOLDER text + «Rreth nesh» link, floral divider above.
5. Footer.

---

## 5. Feature specifications

### 5.1 Catalog & filters
- Filters live in **URL search params** (server-rendered, shareable): `?kategoria=fustane&madhesia=M&ngjyra=roze&rendit=cmimi-ulet&faqe=2`.
- Season pages: category chips at top (only categories valid for that season — Xhaketa appears only under Vjeshtë, Pallto only under Dimër). `/koleksioni` additionally gets a season filter.
- Filter controls: desktop = left sidebar; mobile = «Filtro» button opening a bottom drawer. Color filter shows swatches (from COLORS config) + Albanian name. «Pastro filtrat» resets.
- Sorting («Rendit sipas»): Më të rejat (default), Çmimi: nga më i ulëti, Çmimi: nga më i larti.
- Pagination: 12 per page, numbered, via `faqe` param.
- Empty state: floral divider + «Nuk u gjet asnjë produkt» + «Pastro filtrat» button.

### 5.2 Product detail
- Left: gallery (main image 3:4 + thumbnails, tap/click to switch). Right: category+season eyebrow, name (Playfair), price (+ struck-through compare price and «Ulje» badge if on sale), color name with swatch, **size selector** (pill buttons; required if product has sizes — attempting add without size shows «Zgjidhni madhësinë»), quantity stepper, «Shto në shportë» primary button (disabled + «Nuk është në stok» when out of stock), description, then «Të ngjashme» (4 products, same season+category).
- JSON-LD `Product` schema.

### 5.3 Cart
- zustand store persisted to `localStorage` key `taljamom-cart`. Item: `{ productId, slug, name, priceCents, size, color, image, quantity }`.
- Adding opens a **drawer** from the right: «U shtua në shportë ✓», item summary, buttons «Shiko shportën» / «Vazhdo blerjet».
- `/shporta`: line items (image, name, size, qty stepper, remove ×), Nëntotali, shipping note («Transporti llogaritet në arkë» or free-shipping progress «Edhe X € për transport falas» when `freeShippingOverCents` is set), CTA «Përfundo porosinë». Empty state: «Shporta juaj është bosh» + «Shiko Koleksionin».
- Prices re-validated server-side at checkout; cart only displays.

### 5.4 Checkout & orders
- `/porosia`: left = form (react-hook-form + zod, Albanian error messages from §6), right = order summary.
- Fields: Emri*, Mbiemri*, Numri i telefonit* (lenient AL validation: allow `+355…` or `06…`, min 9 digits), Email (opsionale), Qyteti*, Adresa*, Shënime shtesë (opsionale).
- **Mënyra e pagesës** (radio): «Pagesë në dorëzim (kesh)» default; «Transfertë bankare» — selecting it shows a note that bank details appear after confirmation.
- Anti-spam: honeypot field + max 5 orders per IP per hour (simple in-memory or DB check).
- Submit → Server Action: re-fetch products, verify `inStock`, compute subtotal/shipping/total from DB + Settings, create Order+Items in a transaction via the **PaymentProvider** interface (§7), clear cart, redirect to `/porosia/faleminderit/[orderNumber]`.
- Confirmation page: «Faleminderit! Porosia juaj u pranua.», order number, «Do t'ju kontaktojmë së shpejti për konfirmimin e porosisë.»; if bank transfer → panel «Të dhënat bankare» (bank, IBAN, holder, amount, order number as payment reference).
- Optional (env-gated `SMTP_*`): nodemailer email to `SHOP_NOTIFICATION_EMAIL` on each new order, and to the customer if email given. Skip silently if not configured — orders are always visible in admin.

### 5.5 Admin panel
- Auth.js credentials login (`/admin/login` — Email, Fjalëkalimi, Hyr). Admin seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env. Middleware protects everything under `/admin`.
- Layout: sidebar — Paneli, Produktet, Porositë, Cilësimet, Dil.
- **Paneli:** counters (Porosi të reja, Porosi këtë muaj, Produkte aktive) + last 5 orders.
- **Produktet:** table (photo, Emri, Stina, Kategoria, Çmimi, Stok, Featured toggle) with search; create/edit form: name, description (textarea), price, compare-at price (optional), season, category (validated by the season↔category rules), color (select from COLORS), sizes (multi-select chips from SIZES + free add), inStock toggle, featured toggle, **multi-image upload** with drag-to-reorder, per-image alt text («Përshkrimi i fotos»), delete. Slug auto-generated from name (editable).
- **Porositë:** table filterable by status; detail view: customer data, items, totals, payment method/status (toggle Paguar/Papaguar), status dropdown (E re → E konfirmuar → E dërguar → E dorëzuar / E anuluar), notes, print-friendly view.
- **Cilësimet:** form for all Settings keys (§3), grouped: Dërgesa (shipping fee, free-over), Pagesa (bank details), Kontakti (phone, email, address, WhatsApp, Instagram, Facebook), Monedha.

### 5.6 Config constants (`lib/config.ts`)
```ts
export const SEASONS = [
  { key: "PRANVERE", slug: "pranvere", label: "Pranverë" },
  { key: "VERE",     slug: "vere",     label: "Verë" },
  { key: "VJESHTE",  slug: "vjeshte",  label: "Vjeshtë" },
  { key: "DIMER",    slug: "dimer",    label: "Dimër" },
] as const;

export const CATEGORIES = [
  { key: "KOSTUME",    slug: "kostume",    label: "Kostume",    seasons: "ALL" },
  { key: "FUSTANE",    slug: "fustane",    label: "Fustane",    seasons: "ALL" },
  { key: "KEMISHA",    slug: "kemisha",    label: "Këmisha",    seasons: "ALL" },
  { key: "PANTALLONA", slug: "pantallona", label: "Pantallona", seasons: "ALL" },
  { key: "XHAKETA",    slug: "xhaketa",    label: "Xhaketa",    seasons: ["VJESHTE"] },
  { key: "PALLTO",     slug: "pallto",     label: "Pallto",     seasons: ["DIMER"] },
] as const;

export const COLORS = [
  { key: "e-bardhe",  label: "E bardhë",  hex: "#FFFFFF" },
  { key: "e-zeze",    label: "E zezë",    hex: "#1A1A1A" },
  { key: "bezhe",     label: "Bezhë",     hex: "#D9C7B2" },
  { key: "krem",      label: "Krem",      hex: "#F3EBDD" },
  { key: "roze",      label: "Rozë",      hex: "#EFC6C2" },
  { key: "e-kuqe",    label: "E kuqe",    hex: "#B94A48" },
  { key: "bordo",     label: "Bordo",     hex: "#7B2D3B" },
  { key: "blu",       label: "Blu",       hex: "#2C3E70" },
  { key: "jeshile",   label: "Jeshile",   hex: "#4E6E58" },
  { key: "kafe",      label: "Kafe",      hex: "#6B4A3B" },
  { key: "gri",       label: "Gri",       hex: "#9AA0A6" },
  { key: "ari",       label: "Ari",       hex: "#C9A96A" },
  { key: "multikolor",label: "Multikolor",hex: "linear" },
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Një masë"] as const;
```

### 5.7 Images & storage
- Admin upload → API route → **sharp**: convert to WebP, generate `-1600`, `-800`, `-400` variants, save via a `StorageService` interface.
- v1 implementation: **local disk** at `UPLOADS_DIR` env (persistent volume in production), served by `/api/uploads/[...path]` with `Cache-Control: public, max-age=31536000, immutable`. (If deploying on Vercel instead of a VPS, swap the `StorageService` implementation for Vercel Blob — nothing else changes.)
- All rendering through `next/image` with proper `sizes`; product cards lazy-load; hero image `priority`.

### 5.8 SEO & quality
- `html lang="sq"`. Per-page `metadata` in Albanian (titles like «Fustane – Vjeshtë | Talja&mom»). OpenGraph defaults + product OG images. `sitemap.ts`, `robots.ts`, canonical URLs. 404 page: «Faqja nuk u gjet» + link home.
- Accessibility: visible focus states, alt text everywhere, drawer/menu focus-trapped, AA contrast, `prefers-reduced-motion` respected.
- Verify **ë/ç render correctly** in both fonts on all pages.

---

## 6. Albanian UI dictionary — use EXACTLY

Create `lib/i18n/sq.ts` exporting one flat object; ALL user-facing strings come from it (public + admin). If a needed string is missing, add it to the dictionary and flag it in the PR/commit message — do not scatter literals in components.

```ts
export const t = {
  // Navigation & global
  kryefaqja: "Kryefaqja",
  koleksioni: "Koleksioni",
  teGjitha: "Të gjitha",
  rrethNesh: "Rreth nesh",
  kontakt: "Kontakt",
  kerko: "Kërko",
  shporta: "Shporta",
  menu: "Menu",
  mbyll: "Mbyll",

  // Seasons & categories: labels come from lib/config.ts (§5.6)

  // Homepage
  heroTitull: "Elegancë për çdo stinë",            // PLACEHOLDER — confirm with owner
  heroSubtitull: "Koleksione të përzgjedhura për çdo moment", // PLACEHOLDER
  shikoKoleksionin: "Shiko Koleksionin",
  teRejat: "Të rejat",
  shikoTeGjitha: "Shiko të gjitha",

  // Catalog & product
  filtro: "Filtro",
  pastroFiltrat: "Pastro filtrat",
  renditSipas: "Rendit sipas",
  meTeRejat: "Më të rejat",
  cmimiUlet: "Çmimi: nga më i ulëti",
  cmimiLarte: "Çmimi: nga më i larti",
  stina: "Stina",
  kategoria: "Kategoria",
  madhesia: "Madhësia",
  ngjyra: "Ngjyra",
  cmimi: "Çmimi",
  ulje: "Ulje",
  neStok: "Në stok",
  jashteStokut: "Nuk është në stok",
  shikoDetajet: "Shiko detajet",
  shtoNeShporte: "Shto në shportë",
  zgjidhniMadhesine: "Zgjidhni madhësinë",
  sasia: "Sasia",
  pershkrimi: "Përshkrimi",
  teNgjashme: "Të ngjashme",
  asnjeProdukt: "Nuk u gjet asnjë produkt",

  // Cart
  uShtuaNeShporte: "U shtua në shportë",
  shikoShporten: "Shiko shportën",
  vazhdoBlerjet: "Vazhdo blerjet",
  shportaBosh: "Shporta juaj është bosh",
  nentotali: "Nëntotali",
  transporti: "Transporti",
  transportiNeArke: "Transporti llogaritet në arkë",
  transportFalas: "Transport falas",
  totali: "Totali",
  hiq: "Hiq",
  perfundoPorosine: "Përfundo porosinë",

  // Checkout
  teDhenatEPorosise: "Të dhënat e porosisë",
  emri: "Emri",
  mbiemri: "Mbiemri",
  numriTelefonit: "Numri i telefonit",
  email: "Email (opsionale)",
  qyteti: "Qyteti",
  adresa: "Adresa",
  shenimeShtese: "Shënime shtesë (opsionale)",
  menyraPageses: "Mënyra e pagesës",
  pagesaNeDorezim: "Pagesë në dorëzim (kesh)",
  transfertaBankare: "Transfertë bankare",
  transfertaShenim: "Të dhënat bankare do t'ju shfaqen pas konfirmimit të porosisë.",
  porositTani: "Porosit tani",
  dukeUDerguar: "Duke u dërguar...",

  // Validation
  fushaDetyrueshme: "Kjo fushë është e detyrueshme",
  telefonInvalid: "Numri i telefonit nuk është i saktë",
  emailInvalid: "Adresa e email-it nuk është e saktë",

  // Confirmation
  faleminderit: "Faleminderit! Porosia juaj u pranua.",
  numriPorosise: "Numri i porosisë",
  doJuKontaktojme: "Do t'ju kontaktojmë së shpejti për konfirmimin e porosisë.",
  teDhenatBankare: "Të dhënat bankare",
  banka: "Banka",
  llogaria: "IBAN",
  perfituesi: "Përfituesi",
  pershkrimiPageses: "Përshkrimi i pagesës",

  // Footer & pages
  informacion: "Informacion",
  politikaKthimit: "Politika e kthimit",
  kushtetPerdorimit: "Kushtet e përdorimit",
  teDrejtat: "Të gjitha të drejtat e rezervuara.",
  naShkruaniWhatsApp: "Na shkruani në WhatsApp",
  faqjaNukUGjet: "Faqja nuk u gjet",
  ktheuNeKryefaqe: "Kthehu në kryefaqe",

  // Admin
  paneli: "Paneli",
  produktet: "Produktet",
  porosite: "Porositë",
  cilesimet: "Cilësimet",
  hyr: "Hyr",
  dil: "Dil",
  fjalekalimi: "Fjalëkalimi",
  shtoProdukt: "Shto produkt",
  ruaj: "Ruaj",
  fshi: "Fshi",
  emriProduktit: "Emri i produktit",
  fotot: "Fotot",
  pershkrimiFotos: "Përshkrimi i fotos",
  statusi: "Statusi",
  eRe: "E re",
  eKonfirmuar: "E konfirmuar",
  eDerguar: "E dërguar",
  eDorezuar: "E dorëzuar",
  eAnuluar: "E anuluar",
  paguar: "Paguar",
  papaguar: "Papaguar",
  porosiTeReja: "Porosi të reja",
  porosiKeteMuaj: "Porosi këtë muaj",
  produkteAktive: "Produkte aktive",
} as const;
```

**Price formatting helper (`lib/money.ts`):** `formatPrice(cents, currency)` → EUR: `€ 45` / `€ 45,50`; LEK: `4.500 L` (dot as thousands separator, no decimals). Read currency from Settings once per request.

---

## 7. Payment-ready architecture (build in Phase 4, verify in Phase 7)

Goal: v1 ships with COD + bank transfer only, but adding a card gateway later (local bank virtual POS, Paysera, 2Checkout/Verifone…) must be a matter of adding **one provider file + env vars** — no refactor.

```ts
// lib/payments/types.ts
export interface PaymentInitResult {
  status: "confirmed" | "pending_redirect";
  redirectUrl?: string;          // set when the provider needs an external hosted page
}

export interface PaymentProvider {
  id: "cod" | "bank_transfer" | string;
  /** Called inside the order-creation flow, after totals are computed. */
  init(order: OrderForPayment): Promise<PaymentInitResult>;
  /** Optional: called by /api/payments/[provider]/webhook */
  handleWebhook?(req: Request): Promise<{ orderNumber: string; paid: boolean } | null>;
}
```

- `providers/cod.ts` → returns `{ status: "confirmed" }` (paymentStatus stays UNPAID until delivery; admin marks Paguar).
- `providers/bank-transfer.ts` → `{ status: "confirmed" }`; confirmation page shows bank details from Settings.
- `lib/payments/registry.ts` maps `PaymentMethod` → provider. Checkout Server Action ALWAYS goes through the registry, never talks to a method directly.
- `/api/payments/[provider]/webhook/route.ts` exists now, resolves the provider, returns 404 for unknown ones. A future card provider implements `handleWebhook` to flip `paymentStatus = PAID` and (optionally) `status = KONFIRMUAR`.
- Order flow already supports `pending_redirect`: if a provider returns a `redirectUrl`, the action redirects there instead of the thank-you page. With COD/bank-transfer this path is never hit, but it is implemented and typed.
- Keep commented env placeholders in `.env.example`: `# PAYMENT_CARD_PROVIDER=`, `# CARD_MERCHANT_ID=`, `# CARD_SECRET=`.
- `docs/adding-a-card-provider.md`: short guide (create provider file, register it, add `CARD` to the checkout radio via a feature flag Setting `cardPaymentsEnabled`).

**Note for the owner (not a website task):** Albanian fiscalization ("fiskalizimi") of invoices/receipts is handled by the shop's existing fiscal process/accountant, not by this website. Confirm obligations with the accountant before enabling card payments.

---

## 8. Build phases — execute strictly in order

### Phase 0 — Scaffold & design system
- `create-next-app` (TypeScript, App Router, Tailwind, ESLint, `src/` dir).
- Fonts via `next/font/google` (Playfair Display + Poppins, latin + latin-ext), wired to `--font-display` / `--font-sans`.
- `globals.css` with the `@theme` tokens from §2.1. `html lang="sq"`.
- Build `lib/config.ts` (§5.6), `lib/i18n/sq.ts` (§6), `lib/money.ts`.
- Header + mobile overlay menu + Footer + WhatsApp floating button (§2.4), floral SVG motif component (§2.3).
- A temporary `/dev/stil` page rendering tokens, buttons, typography, the floral divider (delete before launch).
**Acceptance:** `npm run build` clean; header/footer responsive 360px→1440px; ë/ç render correctly; nav links point to (not yet built) routes.

### Phase 1 — Database & seed
- `docker-compose.yml` with Postgres for local dev. Prisma schema from §3, first migration.
- Seed script: admin user (bcrypt hash from `ADMIN_EMAIL`/`ADMIN_PASSWORD`), Settings placeholders, ~16 sample products covering all seasons/categories (respecting the Xhaketa/Pallto rules), 2–3 images each via `https://picsum.photos` (add to `images.remotePatterns`; replaced by real photos later), a few `featured`, one on sale, one out of stock.
**Acceptance:** `prisma migrate dev` + `prisma db seed` succeed; Prisma Studio shows valid data; no seed violates season↔category rules.

### Phase 2 — Public catalog
- Homepage per §4 (hero, seasons grid, Të rejat, about teaser).
- `/koleksioni` + `/koleksioni/[stina]` with filters, sorting, pagination per §5.1 (server components, Prisma queries built from searchParams).
- ProductCard per §2.3; `/produkt/[slug]` per §5.2 with related products and JSON-LD.
**Acceptance:** filters combine & are shareable via URL; category chips respect season rules; sale badge, out-of-stock overlay and empty state all render; mobile filter drawer usable; Lighthouse ≥ 90 performance on `/koleksioni`.

### Phase 3 — Cart
- zustand persisted store, header badge, add-to-cart drawer, `/shporta` page per §5.3.
**Acceptance:** cart survives refresh; quantity edit & remove recompute totals; same product in two sizes = two lines; empty state correct.

### Phase 4 — Checkout & orders (with payment abstraction)
- Build `lib/payments/*` per §7 FIRST, then the checkout Server Action on top of it.
- `/porosia` form per §5.4 with zod + Albanian messages; honeypot + rate limit; confirmation page incl. bank-details panel; optional SMTP notifications behind env flag.
**Acceptance:** order lands in DB with correct server-computed totals & `TM-YYYY-NNNN` number; validation messages in Albanian; bank transfer shows details; cart clears; out-of-stock product in cart blocks submission with a clear Albanian message.

### Phase 5 — Admin panel
- Auth.js credentials + middleware; layout; Paneli, Produktet (CRUD + image upload pipeline §5.7 with sharp/WebP variants + drag-reorder), Porositë (list/detail/status/payment toggle/print view), Cilësimet — all per §5.5.
**Acceptance:** non-authenticated `/admin/*` redirects to login; full product lifecycle works incl. images; season↔category validation blocks e.g. Pallto+Verë; order status/payment updates persist; settings edits reflect on the public site (revalidate).

### Phase 6 — Content, SEO & polish
- Static pages (Rreth nesh, Kontakt, Politika e kthimit, Kushtet) with clearly marked PLACEHOLDER copy; metadata, sitemap, robots, OG images, 404, loading/skeleton states; ISR/`revalidateTag` so admin edits appear without redeploy; delete `/dev/stil`.
**Acceptance:** Lighthouse SEO ≥ 95 & a11y ≥ 95 on home, catalog, product; all pages have Albanian titles/descriptions; no English strings anywhere on the public site.

### Phase 7 — Hardening
- zod-validated env (`lib/env.ts`); error boundaries + friendly Albanian error page; verify webhook stub & `pending_redirect` path with a fake provider in a test; basic request logging on order creation; `README.md` (setup, envs, deploy).
**Acceptance:** `npm run build` clean; intentionally broken env fails fast with a clear message; fake redirect provider test passes.

### Phase 8 — Deployment (see §10)
**Acceptance:** production URL over HTTPS; admin reachable & secured; uploads persist across deploys; DB backup job verified; forms & orders work end-to-end in production.

---

## 9. Environment variables (`.env.example`)

```
DATABASE_URL=postgresql://...
AUTH_SECRET=            # openssl rand -base64 32
NEXT_PUBLIC_SITE_URL=https://example.al
ADMIN_EMAIL=
ADMIN_PASSWORD=         # used only by seed
UPLOADS_DIR=/app/uploads
# Optional email notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SHOP_NOTIFICATION_EMAIL=
# Future card payments (§7)
# PAYMENT_CARD_PROVIDER=
# CARD_MERCHANT_ID=
# CARD_SECRET=
```

---

## 10. Deployment — Hetzner VPS + Coolify (primary target)

1. Hetzner Cloud VPS (shared CX-class, 2 vCPU / 4 GB, Falkenstein or Nuremberg — lowest latency EU region to Albania), Ubuntu 24.04.
2. Install **Coolify** (official curl installer). Point a subdomain (e.g. `panel.`) at the server for Coolify itself.
3. In Coolify: create a **PostgreSQL** resource; create the **Next.js app** from the GitHub repo (Nixpacks default build). Set env vars from §9.
4. Add a **persistent volume** mounted at `/app/uploads` (matches `UPLOADS_DIR`).
5. Domain + automatic Let's Encrypt SSL via Coolify.
6. Put **Cloudflare (free)** in front: DNS proxied, cache rules for `/_next/static/*` and `/api/uploads/*` — static assets then get served from Cloudflare's edge close to Albanian users.
7. Backups: Coolify scheduled Postgres dumps (daily) + copy of the uploads volume; store off-server (Hetzner Storage Box or S3-compatible).
8. Run seed once against production DB; change admin password after first login.

**Alternative (zero-ops): Vercel Pro** + Neon Postgres + Vercel Blob (swap `StorageService` implementation). Higher monthly cost, no server maintenance. Note: Vercel's free Hobby tier does not allow commercial use.

---

## 11. Final QA checklist

- [ ] Mobile 360px: menu, filters drawer, product page, cart, checkout all usable with thumb-sized targets.
- [ ] Xhaketa visible only under Vjeshtë; Pallto only under Dimër (public + admin enforced).
- [ ] Filters: every combination of stina × kategoria × madhësia × ngjyra returns correct results; URLs shareable.
- [ ] Prices format correctly in the configured currency everywhere (card, detail, cart, checkout, emails, admin).
- [ ] Order E2E: add → cart → checkout (both payment methods) → confirmation → visible in admin → status transitions.
- [ ] Images: WebP variants generated; product photos sharp on retina; hero LCP < 2.5s on 4G.
- [ ] ë / ç correct in Playfair and Poppins on all pages.
- [ ] All PLACEHOLDER content replaced and confirmed by the owner (texts, photos, bank details, shipping fee, contacts).
- [ ] No English strings on the public site; admin fully in Albanian.
- [ ] Backups configured and restore tested once.

---

## 12. Explicitly OUT of scope for v1

- Online card payments (architecture ready per §7 — flip on later).
- Customer accounts / login, wishlist, coupons, product reviews.
- Per-size stock tracking (v1 = simple in-stock flag; orders are confirmed by phone anyway).
- Multi-language (structure allows it later: all strings already centralized in `lib/i18n/sq.ts`).
- Invoicing / fiscalization integration (owner's accountant handles it).
