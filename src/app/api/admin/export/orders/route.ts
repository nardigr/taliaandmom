import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function csvEscape(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const headers = [
    "orderNumber",
    "status",
    "paymentMethod",
    "paymentStatus",
    "firstName",
    "lastName",
    "phone",
    "email",
    "address",
    "city",
    "notes",
    "subtotalCents",
    "shippingCents",
    "totalCents",
    "itemCount",
    "createdAt",
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    order.status,
    order.paymentMethod,
    order.paymentStatus,
    order.firstName,
    order.lastName,
    order.phone,
    order.email ?? "",
    order.address,
    order.city,
    order.notes ?? "",
    String(order.subtotalCents),
    String(order.shippingCents),
    String(order.totalCents),
    String(order.items.length),
    order.createdAt.toISOString(),
  ]);

  const csv = toCsv(headers, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="porosite.csv"',
    },
  });
}
