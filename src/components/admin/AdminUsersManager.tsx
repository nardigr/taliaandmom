"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  createAdminUserAction,
  deleteAdminUserAction,
  type AdminUserListItem,
} from "@/lib/admin/admin-users-actions";
import type { AdminActionState } from "@/lib/admin/actions";
import { t } from "@/lib/i18n/sq";

type AdminUsersManagerProps = {
  admins: AdminUserListItem[];
  currentAdminId: string;
};

const initialState: AdminActionState = {};

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";

export function AdminUsersManager({
  admins,
  currentAdminId,
}: AdminUsersManagerProps) {
  const [createState, createAction, createPending] = useActionState(
    createAdminUserAction,
    initialState,
  );
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const canDeleteOthers = admins.length > 1;

  return (
    <div className="max-w-xl space-y-8 border-t border-beige pt-10">
      <div>
        <h2 className="font-display text-2xl text-choco">{t.administratorët}</h2>
        <ul className="mt-6 space-y-3">
          {admins.map((admin) => {
            const isSelf = admin.id === currentAdminId;
            return (
              <li
                key={admin.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-beige bg-cream px-4 py-3"
              >
                <div>
                  <p className="font-medium text-choco">
                    {admin.name}
                    {isSelf && (
                      <span className="ml-2 text-xs uppercase tracking-[0.2em] text-choco-soft">
                        ({t.ti})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-choco-soft">{admin.email}</p>
                </div>
                {!isSelf && canDeleteOthers && (
                  <button
                    type="button"
                    disabled={deletePending}
                    onClick={() => {
                      if (!confirm(t.konfirmoFshirjen)) return;
                      setDeleteError(undefined);
                      startDelete(async () => {
                        const result = await deleteAdminUserAction(admin.id);
                        if (result.error) setDeleteError(result.error);
                      });
                    }}
                    className="rounded-lg border border-beige bg-ivory px-4 py-2 text-sm text-choco transition-colors hover:bg-rose-soft disabled:opacity-50"
                  >
                    {deletePending ? t.dukeUDerguar : t.fshiAdmin}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {deleteError && (
          <div className="mt-3 rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
            {deleteError}
          </div>
        )}
      </div>

      <form action={createAction} className="space-y-6">
        <h3 className="font-display text-xl text-choco">{t.shtoAdmin}</h3>
        {createState.error && (
          <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
            {createState.error}
          </div>
        )}
        {createState.success && (
          <div className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco">
            {createState.success}
          </div>
        )}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.emri}
          </span>
          <input name="name" required className={`mt-2 ${inputClass}`} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.emailAdmin}
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.fjalekalimi}
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.konfirmoFjalekalimin}
          </span>
          <input
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <Button type="submit" disabled={createPending}>
          {createPending ? t.dukeUDerguar : t.shtoAdmin}
        </Button>
      </form>
    </div>
  );
}
