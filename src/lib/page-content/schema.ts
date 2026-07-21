export type ContentFieldType = "text" | "richText" | "image" | "images";

export type ContentSection = {
  key: string;
  label: string;
  type: ContentFieldType;
  defaultKey?: string;
  help?: string;
  group?: string;
};

export type EditablePage = {
  slug: string;
  label: string;
  path: string;
  sections: ContentSection[];
};

export const EDITABLE_PAGES: EditablePage[] = [
  {
    slug: "home",
    label: "Kryefaqja",
    path: "/",
    sections: [
      {
        key: "hero.title",
        label: "Hero — titulli",
        type: "text",
        defaultKey: "heroTitull",
        group: "Hero",
      },
      {
        key: "hero.subtitle",
        label: "Hero — nëntitulli",
        type: "text",
        defaultKey: "heroSubtitull",
        group: "Hero",
      },
      {
        key: "hero.cta",
        label: "Hero — butoni CTA",
        type: "text",
        defaultKey: "shikoKoleksionin",
        group: "Hero",
      },
      {
        key: "hero.backgroundImage",
        label: "Hero — imazh sfondi (opsional)",
        type: "image",
        group: "Hero",
        help: "Sfondi i butë pas dritares së carousel.",
      },
      {
        key: "hero.carouselImages",
        label: "Hero — fotot e carousel",
        type: "images",
        group: "Hero",
        help: "Ngarko foto dhe zgjidh linkun (koleksion / kategori). Nëse bosh, shfaqen produktet Featured.",
      },
      {
        key: "newArrivals.title",
        label: "New Arrivals — titulli",
        type: "text",
        defaultKey: "teRejat",
        group: "New Arrivals",
        help: "Seksioni poshtë hero me produktet më të reja.",
      },
      {
        key: "seasons.title",
        label: "Koleksionet — titulli",
        type: "text",
        defaultKey: "zgjidhStinen",
        group: "Koleksionet",
      },
      {
        key: "about.teaser",
        label: "Seksioni rreth nesh — teaser",
        type: "text",
        defaultKey: "aboutTeaser",
        group: "Rreth nesh",
      },
    ],
  },
  {
    slug: "rreth-nesh",
    label: "Rreth nesh",
    path: "/rreth-nesh",
    sections: [
      { key: "paragraph1", label: "Paragrafi 1", type: "richText", defaultKey: "rrethNeshParagraf1" },
      { key: "paragraph2", label: "Paragrafi 2", type: "richText", defaultKey: "rrethNeshParagraf2" },
      { key: "paragraph3", label: "Paragrafi 3", type: "richText", defaultKey: "rrethNeshParagraf3" },
    ],
  },
  {
    slug: "kontakt",
    label: "Kontakt",
    path: "/kontakt",
    sections: [
      { key: "intro", label: "Hyrje", type: "text", defaultKey: "kontaktIntro" },
    ],
  },
  {
    slug: "politika-e-kthimit",
    label: "Politika e kthimit",
    path: "/politika-e-kthimit",
    sections: [
      { key: "paragraph1", label: "Paragrafi 1", type: "richText", defaultKey: "politikaKthimitParagraf1" },
      { key: "paragraph2", label: "Paragrafi 2", type: "richText", defaultKey: "politikaKthimitParagraf2" },
      { key: "paragraph3", label: "Paragrafi 3", type: "richText", defaultKey: "politikaKthimitParagraf3" },
    ],
  },
  {
    slug: "kushtet-e-perdorimit",
    label: "Kushtet e përdorimit",
    path: "/kushtet-e-perdorimit",
    sections: [
      { key: "paragraph1", label: "Paragrafi 1", type: "richText", defaultKey: "kushtetParagraf1" },
      { key: "paragraph2", label: "Paragrafi 2", type: "richText", defaultKey: "kushtetParagraf2" },
      { key: "paragraph3", label: "Paragrafi 3", type: "richText", defaultKey: "kushtetParagraf3" },
    ],
  },
  {
    slug: "footer",
    label: "Footer",
    path: "/",
    sections: [
      { key: "tagline", label: "Tagline", type: "text", defaultKey: "footerTagline" },
    ],
  },
];

export function getEditablePage(slug: string) {
  return EDITABLE_PAGES.find((page) => page.slug === slug) ?? null;
}

export const PAGE_SEO_PRESETS = [
  { slug: "home", label: "Kryefaqja", path: "/" },
  { slug: "koleksioni", label: "Koleksioni", path: "/koleksioni" },
  { slug: "rreth-nesh", label: "Rreth nesh", path: "/rreth-nesh" },
  { slug: "kontakt", label: "Kontakt", path: "/kontakt" },
  { slug: "politika-e-kthimit", label: "Politika e kthimit", path: "/politika-e-kthimit" },
  { slug: "kushtet-e-perdorimit", label: "Kushtet e përdorimit", path: "/kushtet-e-perdorimit" },
  { slug: "shporta", label: "Shporta", path: "/shporta" },
] as const;
