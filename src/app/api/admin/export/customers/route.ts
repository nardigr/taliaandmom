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

  const customers = await db.customer.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const headers = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "city",
    "address",
    "tags",
    "orderCount",
    "createdAt",
    "updatedAt",
  ];

  const rows = customers.map((customer) => [
    customer.firstName,
    customer.lastName,
    customer.email ?? "",
    customer.phone,
    customer.city ?? "",
    customer.address ?? "",
    customer.tags.join("; "),
    String(customer._count.orders),
    customer.createdAt.toISOString(),
    customer.updatedAt.toISOString(),
  ]);

  const csv = toCsv(headers, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="klientet.csv"',
    },
  });
}
