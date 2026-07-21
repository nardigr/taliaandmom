import { notFound } from "next/navigation";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { getAllCollections } from "@/lib/collections";
import { getPageContentOverrides } from "@/lib/page-content/get-overrides";
import { getEditablePage } from "@/lib/page-content/schema";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminFaqetEditPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getEditablePage(slug);
  if (!page) notFound();

  const [overrides, collections] = await Promise.all([
    getPageContentOverrides(slug),
    getAllCollections(),
  ]);

  return (
    <PageContentForm
      page={page}
      overrides={overrides}
      collections={collections.map((item) => ({
        slug: item.slug,
        label: item.label,
      }))}
    />
  );
}
