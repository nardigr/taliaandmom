"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { customerNotesSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import type { AdminActionState } from "@/lib/admin/actions";

export async function updateCustomerNotesAction(
  customerId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = customerNotesSchema.safeParse({
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  await db.customer.update({
    where: { id: customerId },
    data: {
      notes: parsed.data.notes ?? "",
      tags,
    },
  });

  revalidatePath(`/admin/klientet/${customerId}`);
  revalidatePath("/admin/klientet");
  return { success: t.uRuajt };
}
