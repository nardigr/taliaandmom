import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import {
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/lib/admin/actions";
import { PrintOrderButton } from "@/components/admin/PrintOrderButton";
import { t } from "@/lib/i18n/sq";

type OrderControlsProps = {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
};

const statuses: OrderStatus[] = [
  OrderStatus.E_RE,
  OrderStatus.KONFIRMUAR,
  OrderStatus.DERGUAR,
  OrderStatus.DOREZUAR,
  OrderStatus.ANULUAR,
];

const statusLabels: Record<OrderStatus, string> = {
  E_RE: t.eRe,
  KONFIRMUAR: t.eKonfirmuar,
  DERGUAR: t.eDerguar,
  DOREZUAR: t.eDorezuar,
  ANULUAR: t.eAnuluar,
};

export function OrderControls({
  orderId,
  status,
  paymentStatus,
}: OrderControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 print:hidden">
      <form action={updateOrderStatusAction.bind(null, orderId)} className="flex items-end gap-3">
        <label>
          <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.statusi}
          </span>
          <select
            name="status"
            defaultValue={status}
            className="mt-2 block rounded-lg border border-beige bg-ivory px-4 py-3"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-choco px-5 py-3 text-xs uppercase tracking-wider text-ivory"
        >
          {t.ruaj}
        </button>
      </form>

      <form action={updateOrderPaymentStatusAction.bind(null, orderId)}>
        <input
          type="hidden"
          name="paymentStatus"
          value={
            paymentStatus === PaymentStatus.PAID
              ? PaymentStatus.UNPAID
              : PaymentStatus.PAID
          }
        />
        <button
          type="submit"
          className="mt-6 rounded-full border border-beige px-5 py-3 text-xs uppercase tracking-wider text-choco"
        >
          {paymentStatus === PaymentStatus.PAID ? t.papaguar : t.paguar}
        </button>
      </form>

      <PrintOrderButton />
    </div>
  );
}

export function paymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case PaymentMethod.CASH_ON_DELIVERY:
      return t.pagesaNeDorezim;
    case PaymentMethod.BANK_TRANSFER:
      return t.transfertaBankare;
    default:
      return method;
  }
}
