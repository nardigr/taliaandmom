"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { profileFormSchema, changePasswordSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import type { AdminActionState } from "@/lib/admin/actions";

export async function updateProfileAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  const parsed = profileFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const { name, email } = parsed.data;
  const existing = await db.adminUser.findFirst({
    where: { email, NOT: { id: session.user!.id! } },
  });
  if (existing) {
    return { error: t.emailPerdorur };
  }

  await db.adminUser.update({
    where: { id: session.user!.id! },
    data: { name, email },
  });

  revalidatePath("/admin/profili");
  return { success: t.uRuajt };
}

export async function changePasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const admin = await db.adminUser.findUnique({
    where: { id: session.user!.id! },
  });
  if (!admin) return { error: t.gabimRuajtjes };

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!valid) return { error: t.fjalekalimiAktualGabim };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  return { success: t.fjalekalimiUNdryshua };
}

export async function getCurrentAdminProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.adminUser.findUnique({ where: { id: session.user.id } });
}
