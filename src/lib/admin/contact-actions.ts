"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { contactStatusSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import type { AdminActionState } from "@/lib/admin/actions";

const VALID_STATUSES = new Set(["new", "in_progress", "resolved"]);

export async function updateContactRequestStatusAction(
  requestId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = contactStatusSchema.safeParse({
    status: formData.get("status"),
  });

  if (!parsed.success || !VALID_STATUSES.has(parsed.data.status)) {
    return { error: t.gabimRuajtjes };
  }

  await db.contactRequest.update({
    where: { id: requestId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/epikoinonia");
  return { success: t.uRuajt };
}
