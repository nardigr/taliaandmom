"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { useCartHydrated } from "@/lib/cart/hooks";
import { useCartStore } from "@/lib/cart/store";
import { getCartSubtotalCents } from "@/lib/cart/types";
import { COLORS } from "@/lib/config";
import { createOrder, type CreateOrderState } from "@/lib/orders/actions";
import {
  checkoutClientSchema,
  type CheckoutClientValues,
} from "@/lib/orders/checkout-schema";
import { computeOrderTotals } from "@/lib/orders/shipping";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { formatPrice, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";

type ShippingSettings = {
  shippingFeeCents: number;
  freeShippingOverCents: number | null;
};

type CheckoutFormProps = {
  currency: Currency;
  shipping: ShippingSettings;
};

const initialState: CreateOrderState = {};

export function CheckoutForm({ currency, shipping }: CheckoutFormProps) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const subtotalCents = getCartSubtotalCents(items);
  const totals = computeOrderTotals(subtotalCents, shipping);

  const [state, formAction, pending] = useActionState(createOrder, initialState);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutClientValues>({
    resolver: zodResolver(checkoutClientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      city: "",
      address: "",
      notes: "",
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      website: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      router.replace("/shporta");
    }
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-56 animate-pulse rounded-lg bg-cream" />
      </div>
    );
  }

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("phone", values.phone);
    formData.set("email", values.email?.trim() ?? "");
    formData.set("city", values.city);
    formData.set("address", values.address);
    formData.set("notes", values.notes ?? "");
    formData.set("paymentMethod", values.paymentMethod);
    formData.set("website", values.website ?? "");
    formData.set(
      "items",
      JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      ),
    );

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-choco sm:text-5xl">
        {t.teDhenatEPorosise}
      </h1>

      <form onSubmit={onSubmit} className="mt-10 grid gap-12 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {state.error && (
            <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm text-choco">
              {state.error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label={t.emri}
              error={errors.firstName?.message ?? state.fieldErrors?.firstName?.[0]}
            >
              <input
                {...register("firstName")}
                className={inputClass}
                autoComplete="given-name"
              />
            </Field>
            <Field
              label={t.mbiemri}
              error={errors.lastName?.message ?? state.fieldErrors?.lastName?.[0]}
            >
              <input
                {...register("lastName")}
                className={inputClass}
                autoComplete="family-name"
              />
            </Field>
          </div>

          <Field
            label={t.numriTelefonit}
            error={errors.phone?.message ?? state.fieldErrors?.phone?.[0]}
          >
            <input {...register("phone")} className={inputClass} autoComplete="tel" />
          </Field>

          <Field
            label={t.email}
            error={errors.email?.message ?? state.fieldErrors?.email?.[0]}
          >
            <input {...register("email")} className={inputClass} autoComplete="email" />
          </Field>

          <Field
            label={t.qyteti}
            error={errors.city?.message ?? state.fieldErrors?.city?.[0]}
          >
            <input
              {...register("city")}
              className={inputClass}
              autoComplete="address-level2"
            />
          </Field>

          <Field
            label={t.adresa}
            error={errors.address?.message ?? state.fieldErrors?.address?.[0]}
          >
            <input
              {...register("address")}
              className={inputClass}
              autoComplete="street-address"
            />
          </Field>

          <Field label={t.shenimeShtese} error={errors.notes?.message}>
            <textarea
              {...register("notes")}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </Field>

          <fieldset className="space-y-3">
            <legend className="text-xs uppercase tracking-[0.25em] text-choco-soft">
              {t.menyraPageses}
            </legend>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-beige p-4">
              <input
                type="radio"
                value={PaymentMethod.CASH_ON_DELIVERY}
                {...register("paymentMethod")}
                className="mt-1"
              />
              <span>{t.pagesaNeDorezim}</span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-beige p-4">
              <input
                type="radio"
                value={PaymentMethod.BANK_TRANSFER}
                {...register("paymentMethod")}
                className="mt-1"
              />
              <span>{t.transfertaBankare}</span>
            </label>

            {paymentMethod === PaymentMethod.BANK_TRANSFER && (
              <p className="text-sm text-choco-soft">{t.transfertaShenim}</p>
            )}
          </fieldset>

          <input
            {...register("website")}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden
          />

          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? t.dukeUDerguar : t.porositTani}
          </Button>
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded-lg border border-beige bg-cream p-6">
            <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
              {t.permbledhjaEPorosise}
            </h2>

            <ul className="mt-6 space-y-4">
              {items.map((item) => {
                const color = COLORS.find((entry) => entry.key === item.color);
                return (
                  <li key={item.lineId} className="flex gap-3">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-beige bg-ivory">
                      {item.image ? (
                        <Image
                          src={getProductImageUrl(item.image)}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <Link
                        href={`/produkt/${item.slug}`}
                        className="font-medium text-choco hover:text-choco-soft"
                      >
                        {item.name}
                      </Link>
                      {item.size && (
                        <p className="mt-1 text-choco-soft">
                          {t.madhesia}: {item.size}
                        </p>
                      )}
                      {color && (
                        <p className="text-choco-soft">
                          {t.ngjyra}: {color.label}
                        </p>
                      )}
                      <p className="mt-1 text-choco-soft">
                        {t.sasia}: {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-choco">
                      {formatPrice(item.priceCents * item.quantity, currency)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 space-y-2 border-t border-beige pt-6 text-sm">
              <div className="flex justify-between">
                <span>{t.nentotali}</span>
                <span>{formatPrice(totals.subtotalCents, currency)}</span>
              </div>
              <div className="flex justify-between text-choco-soft">
                <span>{t.transporti}</span>
                <span>
                  {totals.shippingCents === 0
                    ? t.transportFalas
                    : formatPrice(totals.shippingCents, currency)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base font-medium text-choco">
                <span>{t.totali}</span>
                <span>{formatPrice(totals.totalCents, currency)}</span>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-sm text-[#B94A48]">{error}</p>}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none transition-colors focus:border-choco";
