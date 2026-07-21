import { CollectionsManager } from "@/components/admin/CollectionsManager";
import { getAllCollections } from "@/lib/collections";

export default async function AdminCollectionsPage() {
  const collections = await getAllCollections();
  return <CollectionsManager collections={collections} />;
}
