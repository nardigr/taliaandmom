"use client";

import { startTransition, useActionState } from "react";
import { adminLoginAction, type LoginState } from "@/lib/admin/login-action";
import { t } from "@/lib/i18n/sq";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    adminLoginAction,
    initialState,
  );

  return (
    <form
      className="mx-auto w-full max-w-md space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => {
          formAction(formData);
        });
      }}
    >
      <div>
        <h1 className="font-display text-4xl text-choco">{t.hyr}</h1>
        <p className="mt-2 text-sm text-choco-soft">Talja&mom Admin</p>
      </div>

      {state.error && (
        <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm text-choco">
          {state.error}
        </div>
      )}

      <label className="block">
        <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
          {t.emailAdmin}
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-2 w-full rounded-lg border border-beige bg-ivory px-4 py-3"
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
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-beige bg-ivory px-4 py-3"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-choco px-8 py-3 font-sans text-[13px] uppercase tracking-widest text-ivory transition-colors hover:bg-choco-soft disabled:opacity-50"
      >
        {pending ? t.dukeUDerguar : t.hyr}
      </button>
    </form>
  );
}
