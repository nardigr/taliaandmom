import Link from "next/link";
import { EDITABLE_PAGES } from "@/lib/page-content/schema";
import { t } from "@/lib/i18n/sq";

export default function AdminFaqetPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-choco">{t.faqet}</h1>
      <p className="mt-2 text-sm text-choco-soft">{t.permbajtjaFaqes}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EDITABLE_PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/faqet/${page.slug}`}
            className="rounded-xl border border-beige bg-ivory p-6 transition-colors hover:border-choco-soft hover:bg-cream"
          >
            <h2 className="font-display text-xl text-choco">{page.label}</h2>
            <p className="mt-2 text-sm text-choco-soft">{page.path}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-choco-soft">
              {page.sections.length} seksione
            </p>
            {page.slug === "home" ? (
              <p className="mt-3 text-xs text-choco-soft">
                Hero, carousel, koleksione, të rejat. Logo →{" "}
                <span className="text-choco">{t.cilesimet}</span>
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
