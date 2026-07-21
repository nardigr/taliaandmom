"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  changePasswordAction,
  updateProfileAction,
} from "@/lib/admin/profile-actions";
import type { AdminActionState } from "@/lib/admin/actions";
import { t } from "@/lib/i18n/sq";

type AdminProfileFormProps = {
  name: string;
  email: string;
};

const initialState: AdminActionState = {};

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";

export function AdminProfileForm({ name, email }: AdminProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <div className="max-w-xl space-y-12">
      <form action={profileAction} className="space-y-6">
        <h2 className="font-display text-2xl text-choco">{t.ndryshoProfilin}</h2>
        {profileState.error && (
          <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
            {profileState.error}
          </div>
        )}
        {profileState.success && (
          <div className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco">
            {profileState.success}
          </div>
        )}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">{t.emri}</span>
          <input name="name" defaultValue={name} required className={`mt-2 ${inputClass}`} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">{t.emailAdmin}</span>
          <input
            name="email"
            type="email"
            defaultValue={email}
            required
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <Button type="submit" disabled={profilePending}>
          {profilePending ? t.dukeUDerguar : t.ruaj}
        </Button>
      </form>

      <form action={passwordAction} className="space-y-6 border-t border-beige pt-10">
        <h2 className="font-display text-2xl text-choco">{t.ndryshoFjalekalimin}</h2>
        {passwordState.error && (
          <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
            {passwordState.error}
          </div>
        )}
        {passwordState.success && (
          <div className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco">
            {passwordState.success}
          </div>
        )}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.fjalekalimiAktual}
          </span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.fjalekalimiRi}
          </span>
          <input
            name="newPassword"
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
        <Button type="submit" disabled={passwordPending}>
          {passwordPending ? t.dukeUDerguar : t.ndryshoFjalekalimin}
        </Button>
      </form>
    </div>
  );
}
