import type { Prisma } from "@prisma/client";
import { normalizePhone } from "@/lib/customers/normalize-phone";

export type CustomerInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  address?: string | null;
};

type Tx = Prisma.TransactionClient;

export async function findOrCreateCustomer(
  tx: Tx,
  input: CustomerInput,
): Promise<string> {
  const phoneNorm = normalizePhone(input.phone);
  const email = input.email?.trim().toLowerCase() || null;

  let existing = email
    ? await tx.customer.findUnique({ where: { email } })
    : null;

  if (!existing && phoneNorm) {
    const candidates = await tx.customer.findMany({
      where: { phone: { contains: phoneNorm.slice(-8) } },
      take: 20,
    });
    existing =
      candidates.find((c) => normalizePhone(c.phone) === phoneNorm) ?? null;
  }

  if (existing) {
    await tx.customer.update({
      where: { id: existing.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: email ?? existing.email,
        city: input.city ?? existing.city,
        address: input.address ?? existing.address,
      },
    });
    return existing.id;
  }

  const created = await tx.customer.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email,
      city: input.city ?? null,
      address: input.address ?? null,
    },
  });
  return created.id;
}
