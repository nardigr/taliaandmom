"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { requireAdmin } from "@/lib/auth/require-admin";
import { pageContentFormSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { getEditablePage } from "@/lib/page-content/schema";
import { t } from "@/lib/i18n/sq";

export type AdminActionState = {
  error?: string;
  success?: string;
};

function revalidatePageContent(pageSlug: string) {
  revalidateTag(CACHE_TAGS.pageContent, "max");
  const page = getEditablePage(pageSlug);
  if (page?.path) revalidatePath(page.path);
  if (pageSlug === "footer" || pageSlug === "home") {
    revalidatePath("/");
  }
}

export async function savePageContentAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  let sectionsRaw: unknown = [];
  try {
    sectionsRaw = JSON.parse(String(formData.get("sections") ?? "[]"));
  } catch {
    return { error: t.gabimRuajtjes };
  }

  const parsed = pageContentFormSchema.safeParse({
    pageSlug: formData.get("pageSlug"),
    sections: sectionsRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const page = getEditablePage(parsed.data.pageSlug);
  if (!page) return { error: t.gabimRuajtjes };

  await Promise.all(
    parsed.data.sections.map((section) =>
      db.pageContent.upsert({
        where: {
          pageSlug_sectionKey: {
            pageSlug: parsed.data.pageSlug,
            sectionKey: section.sectionKey,
          },
        },
        update: {
          value: section.value,
          imageUrl: section.imageUrl || null,
        },
        create: {
          pageSlug: parsed.data.pageSlug,
          sectionKey: section.sectionKey,
          value: section.value,
          imageUrl: section.imageUrl || null,
        },
      }),
    ),
  );

  revalidatePageContent(parsed.data.pageSlug);
  revalidatePath(`/admin/faqet/${parsed.data.pageSlug}`);
  return { success: t.uRuajt };
}

export async function resetPageContentAction(pageSlug: string): Promise<AdminActionState> {
  await requireAdmin();

  const page = getEditablePage(pageSlug);
  if (!page) return { error: t.gabimRuajtjes };

  await db.pageContent.deleteMany({ where: { pageSlug } });
  revalidatePageContent(pageSlug);
  revalidatePath(`/admin/faqet/${pageSlug}`);
  return { success: t.uRuajt };
}
