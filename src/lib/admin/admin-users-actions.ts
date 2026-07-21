"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminUserSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import type { AdminActionState } from "@/lib/admin/actions";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
};

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  await requireAdmin();
  return db.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });
}

export async function createAdminUserAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = createAdminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: t.emailPerdorur };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.create({
    data: { name, email, passwordHash },
  });

  revalidatePath("/admin/profili");
  return { success: t.adminUShtua };
}

export async function deleteAdminUserAction(
  adminId: string,
): Promise<AdminActionState> {
  const session = await requireAdmin();
  const currentId = session.user!.id!;

  if (adminId === currentId) {
    return { error: t.nukMundTeFshishVeten };
  }

  const count = await db.adminUser.count();
  if (count <= 1) {
    return { error: t.nukMundTeFshishAdmininEFundit };
  }

  const target = await db.adminUser.findUnique({ where: { id: adminId } });
  if (!target) {
    return { error: t.gabimRuajtjes };
  }

  await db.adminUser.delete({ where: { id: adminId } });
  revalidatePath("/admin/profili");
  return { success: t.uFshi };
}
