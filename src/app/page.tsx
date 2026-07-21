import type { Metadata } from "next";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { HeroShowcase } from "@/components/home/HeroShowcase";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { SeasonsGrid } from "@/components/home/SeasonsGrid";
import { getHeroShowcaseProducts } from "@/lib/catalog/queries";
import { getPageContentOverrides } from "@/lib/page-content/get-overrides";
import {
  resolveContentOverride,
  resolveCarouselSlides,
  resolveImageOverride,
} from "@/lib/page-content/resolve";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { t } from "@/lib/i18n/sq";

/** CMS-driven homepage — always read fresh settings / page content. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    pageSlug: "home",
    fallbackTitle: "Talja&mom — Modë femrash",
    fallbackDescription: t.heroSubtitull,
    path: "/",
  });
}

export default async function HomePage() {
  const [overrides, heroProducts] = await Promise.all([
    getPageContentOverrides("home"),
    getHeroShowcaseProducts(6),
  ]);

  const heroTitle = resolveContentOverride(overrides, "hero.title", t.heroTitull);
  const aboutTeaser = resolveContentOverride(overrides, "about.teaser", t.aboutTeaser);
  const newArrivalsTitle = resolveContentOverride(
    overrides,
    "newArrivals.title",
    t.teRejat,
  );
  const seasonsTitle = resolveContentOverride(overrides, "seasons.title", t.zgjidhStinen);
  const heroBackground = resolveImageOverride(overrides, "hero.backgroundImage");
  const carouselSlides = resolveCarouselSlides(overrides, "hero.carouselImages");

  const customSlides = carouselSlides.map((slide, index) => ({
    id: `cms-${index}`,
    href: slide.href,
    name: heroTitle,
    imagePath: slide.url,
    imageAlt: heroTitle,
  }));

  const productSlides = heroProducts
    .map((product) => {
      const image = product.images[0];
      if (!image) return null;
      return {
        id: product.id,
        href: `/produkt/${product.slug}`,
        name: product.name,
        imagePath: image.path,
        imageAlt: image.alt || product.name,
      };
    })
    .filter((slide): slide is NonNullable<typeof slide> => slide !== null);

  const slides = customSlides.length > 0 ? customSlides : productSlides;

  return (
    <div>
      <HeroShowcase slides={slides} backgroundImage={heroBackground} />
      <NewArrivalsSection title={newArrivalsTitle} />
      <SeasonsGrid title={seasonsTitle} />
      <AboutTeaser text={aboutTeaser} />
    </div>
  );
}
