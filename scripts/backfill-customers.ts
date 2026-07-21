import { PrismaClient } from "@prisma/client";
import { normalizePhone } from "../src/lib/customers/normalize-phone";

const db = new PrismaClient();

async function main() {
  const orders = await db.order.findMany({
    where: { customerId: null },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) {
    console.log("No orders without customerId — nothing to backfill.");
    return;
  }

  const groups = new Map<string, typeof orders>();

  for (const order of orders) {
    const email = order.email?.trim().toLowerCase() || null;
    const phoneNorm = normalizePhone(order.phone);
    const key = email ?? (phoneNorm || order.id);
    const existing = groups.get(key);
    if (existing) {
      existing.push(order);
    } else {
      groups.set(key, [order]);
    }
  }

  let created = 0;
  let linked = 0;

  for (const groupOrders of groups.values()) {
    const latest = groupOrders[groupOrders.length - 1]!;

    const email = latest.email?.trim().toLowerCase() || null;
    const phoneNorm = normalizePhone(latest.phone);

    let customer =
      (email ? await db.customer.findUnique({ where: { email } }) : null) ??
      null;

    if (!customer && phoneNorm) {
      const candidates = await db.customer.findMany({
        where: { phone: { contains: phoneNorm.slice(-8) } },
        take: 20,
      });
      customer =
        candidates.find((c) => normalizePhone(c.phone) === phoneNorm) ?? null;
    }

    if (!customer) {
      customer = await db.customer.create({
        data: {
          firstName: latest.firstName,
          lastName: latest.lastName,
          phone: latest.phone,
          email,
          city: latest.city,
          address: latest.address,
        },
      });
      created += 1;
    }

    for (const order of groupOrders) {
      await db.order.update({
        where: { id: order.id },
        data: { customerId: customer.id },
      });
      linked += 1;
    }
  }

  console.log(`Backfill complete: ${created} customers created, ${linked} orders linked.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
