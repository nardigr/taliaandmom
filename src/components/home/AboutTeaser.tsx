import Link from "next/link";
import { FloralMotif } from "@/components/ui/FloralMotif";
import { t } from "@/lib/i18n/sq";

type AboutTeaserProps = {
  text: string;
};

export function AboutTeaser({ text }: AboutTeaserProps) {
  return (
    <section className="bg-ivory py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <FloralMotif variant="divider" />
        <p className="mt-8 text-lg leading-relaxed text-ink">{text}</p>
        <Link
          href="/rreth-nesh"
          className="mt-8 inline-block text-sm uppercase tracking-wider text-choco transition-colors hover:text-choco-soft"
        >
          {t.rrethNesh} →
        </Link>
      </div>
    </section>
  );
}
