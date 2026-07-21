"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";
import { Button } from "@/components/ui/Button";
import {
  deleteCollectionAction,
  saveCollectionAction,
} from "@/lib/admin/collection-actions";
import type { AdminActionState } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/slug";
import type { CollectionItem } from "@/lib/collections";
import { t } from "@/lib/i18n/sq";

type CollectionsManagerProps = {
  collections: CollectionItem[];
};

const initialState: AdminActionState = {};

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";

export function CollectionsManager({ collections }: CollectionsManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [deletePending, startDelete] = useTransition();

  const editing = collections.find((item) => item.id === editingId) ?? null;

  function closeForm() {
    setCreating(false);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-choco">{t.koleksionet}</h1>
          <p className="mt-2 max-w-xl text-sm text-choco-soft">{t.koleksionetNdihme}</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingId(null);
            setCreating(true);
          }}
        >
          {t.shtoKoleksion}
        </Button>
      </div>

      {(creating || editing) && (
        <CollectionForm
          key={editing?.id ?? "new"}
          collection={editing}
          onCancel={() => {
            setCreating(false);
            setEditingId(null);
          }}
          onSaved={closeForm}
        />
      )}

      {deleteError && (
        <p className="rounded-lg border border-rose-deep/30 bg-rose-soft px-4 py-3 text-sm text-choco">
          {deleteError}
        </p>
      )}

      {collections.length === 0 ? (
        <p className="text-sm text-choco-soft">{t.asnjeKoleksion}</p>
      ) : (
        <ul className="space-y-3">
          {collections.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-beige bg-cream px-4 py-4"
            >
              <div>
                <p className="font-display text-2xl text-choco">{item.label}</p>
                <p className="mt-1 text-sm text-choco-soft">
                  /koleksioni/{item.slug}
                  {" · "}
                  {t.renditja}: {item.sortOrder}
                  {" · "}
                  {item.active ? t.aktiv : t.jo}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditingId(item.id);
                  }}
                  className="rounded-lg border border-beige bg-ivory px-4 py-2 text-sm text-choco hover:bg-cream"
                >
                  {t.ndrysho}
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={() => {
                    if (!confirm(t.konfirmoFshirjen)) return;
                    setDeleteError(undefined);
                    startDelete(async () => {
                      const result = await deleteCollectionAction(item.id);
                      if (result.error) setDeleteError(result.error);
                      else router.refresh();
                    });
                  }}
                  className="rounded-lg border border-beige bg-ivory px-4 py-2 text-sm text-choco hover:bg-rose-soft disabled:opacity-50"
                >
                  {t.fshi}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CollectionForm({
  collection,
  onCancel,
  onSaved,
}: {
  collection: CollectionItem | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const bound = saveCollectionAction.bind(null, collection?.id ?? null);
  const [state, formAction, pending] = useActionState(bound, initialState);
  const [label, setLabel] = useState(collection?.label ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(collection));
  const [sortOrder, setSortOrder] = useState(String(collection?.sortOrder ?? 0));
  const [active, setActive] = useState(collection?.active ?? true);
  const [coverImageUrl, setCoverImageUrl] = useState(collection?.coverImageUrl ?? "");
  const [handledSuccess, setHandledSuccess] = useState(false);

  useEffect(() => {
    if (state.success && !handledSuccess) {
      setHandledSuccess(true);
      onSaved();
    }
  }, [state.success, handledSuccess, onSaved]);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-beige bg-cream p-5 sm:p-6"
    >
      <h2 className="font-display text-2xl text-choco">
        {collection ? t.ndryshoKoleksion : t.shtoKoleksion}
      </h2>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-choco-soft">
          {t.emriKoleksionit}
        </span>
        <input
          name="label"
          required
          value={label}
          onChange={(event) => {
            const next = event.target.value;
            setLabel(next);
            if (!slugTouched) setSlug(slugify(next));
          }}
          className={inputClass}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-choco-soft">{t.slug}</span>
        <input
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          className={inputClass}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-choco-soft">
          {t.renditja}
        </span>
        <input
          name="sortOrder"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-choco">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 rounded border-beige"
        />
        {t.aktiv}
      </label>
      <input type="hidden" name="active" value={active ? "true" : "false"} />

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-choco-soft">
          {t.fotoKopertine}
        </span>
        <ContentImageUpload value={coverImageUrl} onChange={setCoverImageUrl} />
        <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      </div>

      {state.error && <p className="text-sm text-rose-deep">{state.error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t.dukeUDerguar : t.ruaj}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-beige bg-ivory px-4 py-2 text-sm text-choco hover:bg-cream"
        >
          {t.anulo}
        </button>
      </div>
    </form>
  );
}
