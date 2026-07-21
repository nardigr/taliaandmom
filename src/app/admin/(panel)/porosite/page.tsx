import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { OrdersTable } from "@/components/admin/AdminTables";
import { t } from "@/lib/i18n/sq";

const statusLabels: Record<OrderStatus, string> = {
  E_RE: t.eRe,
  KONFIRMUAR: t.eKonfirmuar,
  DERGUAR: t.eDerguar,
  DOREZUAR: t.eDorezuar,
  ANULUAR: t.eAnuluar,
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const validStatus = Object.values(OrderStatus).includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-choco">{t.porosite}</h1>
        <a
          href="/api/admin/export/orders"
          className="rounded-lg border border-beige bg-cream px-4 py-2 text-sm text-choco hover:bg-ivory"
        >
          {t.eksportoPorosite}
        </a>
      </div>

      <form className="flex flex-wrap gap-2">
        <FilterLink href="/admin/porosite" active={!validStatus}>
          {t.teGjitha}
        </FilterLink>
        {Object.values(OrderStatus).map((item) => (
          <FilterLink
            key={item}
            href={`/admin/porosite?status=${item}`}
            active={validStatus === item}
          >
            {statusLabels[item]}
          </FilterLink>
        ))}
      </form>

      <OrdersTable status={validStatus} />
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-full border px-4 py-2 text-sm ${
        active
          ? "border-choco bg-choco text-ivory"
          : "border-beige text-choco hover:bg-cream"
      }`}
    >
      {children}
    </a>
  );
}
