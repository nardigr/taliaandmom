import { FloralMotif } from "@/components/ui/FloralMotif";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n/sq";

type StaticPageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function StaticPageLayout({ title, children }: StaticPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <FloralMotif variant="divider" />
      <h1 className="mt-8 font-display text-4xl text-choco sm:text-5xl">{title}</h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-ink">{children}</div>
    </article>
  );
}

export function PlaceholderNotice() {
  return (
    <p className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco-soft">
      PLACEHOLDER — Përmbajtja do të konfirmohet nga pronarja para lançimit.
    </p>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <FloralMotif variant="divider" />
      <h1 className="mt-8 font-display text-4xl text-choco sm:text-5xl">
        {t.faqjaNukUGjet}
      </h1>
      <p className="mt-4 text-choco-soft">404</p>
      <div className="mt-10">
        <Button href="/">{t.ktheuNeKryefaqe}</Button>
      </div>
    </div>
  );
}
